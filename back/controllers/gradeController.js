/**
 * gradeController.js
 * Handles grade management for soutenances:
 *   • enterGrades    – manual entry per soutenance (super_admin)
 *   • getGrades      – fetch grades (super_admin sees all; student sees only published)
 *   • publishGrades  – publish one soutenance's grades → notify students
 *   • publishAllGrades – publish ALL soutenances with status NOTED in one call
 *   • bulkImportGrades – import grades from .xlsx file (multer + xlsx)
 *   • downloadTemplate – download pre-filled Excel template
 *
 * Requires:  npm install xlsx multer
 */

const db   = require("../config/db");
const jwt  = require("jsonwebtoken");
const xlsx = require("xlsx");

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

const getUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [rows] = await db.execute(
    "SELECT id, role FROM users WHERE id = ?",
    [decoded.id]
  );
  if (!rows.length) throw new Error("User not found");
  return rows[0];
};

const sendNotification = async (userId, type, title, message) => {
  await db.execute(
    `INSERT INTO notification (user_id, type, title, message, is_read, created_at)
     VALUES (?, ?, ?, ?, 0, NOW())`,
    [userId, type, title, message]
  );
};

const getTeamUserIds = async (teamId) => {
  const [rows] = await db.execute(
    `SELECT u.id FROM team_member tm
     JOIN users u ON u.id = tm.student_id
     WHERE tm.team_id = ? AND tm.status = 'ACCEPTED'`,
    [teamId]
  );
  return rows.map((r) => r.id);
};

// Grade validator: must be a number between 0 and 20
const validateGrade = (val) => {
  const n = parseFloat(val);
  return !isNaN(n) && n >= 0 && n <= 20 ? n : null;
};

// Compute average of up to 4 grade components
const computeAverage = (oral, deliverables, demo, qa) => {
  const vals = [oral, deliverables, demo, qa].filter((v) => v !== null);
  if (!vals.length) return null;
  return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
};

// ─────────────────────────────────────────────
//  GRADE ENDPOINTS
// ─────────────────────────────────────────────

/**
 * PUT /api/grades/:soutenanceId
 * Enter or update grades for a soutenance manually.
 * Body: { grade_oral, grade_deliverables, grade_demo, grade_qa, jury_observations }
 * Roles allowed: super_admin
 */
exports.enterGrades = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { soutenanceId } = req.params;
    const { grade_oral, grade_deliverables, grade_demo, grade_qa, jury_observations } = req.body;

    // Validate each provided grade
    const oral  = grade_oral         !== undefined ? validateGrade(grade_oral)         : undefined;
    const deliv = grade_deliverables !== undefined ? validateGrade(grade_deliverables) : undefined;
    const demo  = grade_demo         !== undefined ? validateGrade(grade_demo)         : undefined;
    const qa    = grade_qa           !== undefined ? validateGrade(grade_qa)           : undefined;

    const hasInvalid = [
      [grade_oral,         oral],
      [grade_deliverables, deliv],
      [grade_demo,         demo],
      [grade_qa,           qa],
    ].some(([raw, parsed]) => raw !== undefined && parsed === null);

    if (hasInvalid) {
      return res.status(400).json({ message: "All grades must be numbers between 0 and 20." });
    }

    // Fetch soutenance
    const [rows] = await db.execute(
      "SELECT * FROM soutenance WHERE id = ?",
      [soutenanceId]
    );
    if (!rows.length) {
      return res.status(404).json({ message: "Soutenance not found." });
    }
    const s = rows[0];

    if (s.grade_status === "PUBLISHED") {
      return res.status(409).json({
        message: "Grades are already published and cannot be modified.",
      });
    }

    // Update grade columns (keep existing values for any column not provided)
    await db.execute(
      `UPDATE soutenance
       SET grade_oral         = COALESCE(?, grade_oral),
           grade_deliverables = COALESCE(?, grade_deliverables),
           grade_demo         = COALESCE(?, grade_demo),
           grade_qa           = COALESCE(?, grade_qa),
           jury_observations  = COALESCE(?, jury_observations),
           grade_status       = 'NOTED',
           updated_at         = NOW()
       WHERE id = ?`,
      [
        oral  ?? null,
        deliv ?? null,
        demo  ?? null,
        qa    ?? null,
        jury_observations || null,
        soutenanceId,
      ]
    );

    // Compute final average using freshest values
    const average = computeAverage(
      oral  ?? s.grade_oral,
      deliv ?? s.grade_deliverables,
      demo  ?? s.grade_demo,
      qa    ?? s.grade_qa
    );

    if (average !== null) {
      const [existing] = await db.execute(
        "SELECT id FROM soutenance_result WHERE soutenance_id = ?",
        [soutenanceId]
      );
      if (existing.length) {
        await db.execute(
          "UPDATE soutenance_result SET grade = ?, submitted_at = NOW() WHERE soutenance_id = ?",
          [average, soutenanceId]
        );
      } else {
        await db.execute(
          "INSERT INTO soutenance_result (soutenance_id, grade, submitted_at) VALUES (?, ?, NOW())",
          [soutenanceId, average]
        );
      }
    }

    res.json({ message: "Grades saved successfully.", average });
  } catch (err) {
    console.error("enterGrades error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/grades/:soutenanceId
 * Fetch grades for a soutenance.
 * Students only see their own grades if status is PUBLISHED.
 */
exports.getGrades = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    const { soutenanceId } = req.params;

    const [rows] = await db.execute(
      `SELECT s.id,
              s.grade_oral, s.grade_deliverables, s.grade_demo, s.grade_qa,
              s.jury_observations, s.grade_status,
              sr.grade AS final_grade,
              p.title  AS project_title,
              s.date, s.time, s.room_name
       FROM soutenance s
       JOIN project p ON p.id = s.project_id
       LEFT JOIN soutenance_result sr ON sr.soutenance_id = s.id
       WHERE s.id = ?`,
      [soutenanceId]
    );
    if (!rows.length) {
      return res.status(404).json({ message: "Soutenance not found." });
    }

    const sout = rows[0];

    // Students can only see published grades
    if (user.role === "etudiant" && sout.grade_status !== "PUBLISHED") {
      return res.status(403).json({ message: "Grades are not yet published." });
    }

    res.json({ grades: sout });
  } catch (err) {
    console.error("getGrades error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/grades/:soutenanceId/publish
 * Publish grades for a single soutenance.
 * Soutenance must be in NOTED state.
 * Notifies all team members with their final grade.
 * Roles allowed: super_admin
 */
exports.publishGrades = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { soutenanceId } = req.params;

    const [rows] = await db.execute(
      `SELECT s.*, sr.grade AS final_grade, p.title AS project_title
       FROM soutenance s
       LEFT JOIN soutenance_result sr ON sr.soutenance_id = s.id
       JOIN project p ON p.id = s.project_id
       WHERE s.id = ?`,
      [soutenanceId]
    );
    if (!rows.length) {
      return res.status(404).json({ message: "Soutenance not found." });
    }

    const s = rows[0];

    if (s.grade_status !== "NOTED") {
      return res.status(422).json({
        message: "Grades must be entered (NOTED status) before publishing.",
      });
    }

    // Mark as published and completed
    await db.execute(
      `UPDATE soutenance
       SET grade_status = 'PUBLISHED', status = 'COMPLETED', updated_at = NOW()
       WHERE id = ?`,
      [soutenanceId]
    );

    // Notify each team member with their final grade
   if (s.team_id) {
      const memberIds = await getTeamUserIds(s.team_id);
      const gradeDisplay = s.final_grade !== null ? `${s.final_grade}/20` : "N/A";
      const title = "Defense Grade Published";

      // Detailed message for students
      const studentMsg =
        `📋 Project: "${s.project_title}"\n` +
        `🎤 Oral Presentation: ${s.grade_oral ?? "—"}/20\n` +
        `📦 Deliverables Quality: ${s.grade_deliverables ?? "—"}/20\n` +
        `💻 Demo / Application: ${s.grade_demo ?? "—"}/20\n` +
        `❓ Q&A Responses: ${s.grade_qa ?? "—"}/20\n` +
        `⭐ Final Average: ${gradeDisplay}\n` +
        (s.jury_observations ? `📝 Jury observations: ${s.jury_observations}` : "");

      for (const uid of memberIds) {
        await sendNotification(uid, "info", title, studentMsg);
      }

      // Also notify supervisor
     // Notify supervisor — teacher.id = users.id (1-to-1), teacher_id is on project
      const [supRows] = await db.execute(
        `SELECT p.teacher_id
         FROM assignment a
         JOIN project p ON p.id = a.project_id
         WHERE a.team_id = ? LIMIT 1`,
        [s.team_id]
      );
      if (supRows.length && supRows[0].teacher_id) {
        // teacher.id is the same as users.id — notify directly
        await sendNotification(
          supRows[0].teacher_id,
          "info",
          "Defense Grade Published",
          studentMsg
        );
      }
    }

    res.json({ message: "Grades published. Students have been notified." });
  } catch (err) {
    console.error("publishGrades error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/publish-all
 * Publish ALL soutenances that are currently in NOTED state in one batch.
 * Roles allowed: super_admin
 */
exports.publishAllGrades = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Fetch all soutenances in NOTED state with project title and final grade
 // ✅ REPLACE lines 327–333 with:
const [noted] = await db.execute(
  `SELECT s.id, s.team_id,
          s.grade_oral, s.grade_deliverables, s.grade_demo, s.grade_qa,
          s.jury_observations,
          p.title AS project_title,
          sr.grade AS final_grade
   FROM soutenance s
   JOIN project p ON p.id = s.project_id
   LEFT JOIN soutenance_result sr ON sr.soutenance_id = s.id
   WHERE s.grade_status = 'NOTED'`
);

    if (!noted.length) {
      return res.json({ message: "No soutenances in NOTED state to publish.", published: 0 });
    }

    for (const s of noted) {
      // Mark as published
      await db.execute(
        `UPDATE soutenance
         SET grade_status = 'PUBLISHED', status = 'COMPLETED', updated_at = NOW()
         WHERE id = ?`,
        [s.id]
      );

      // Notify team members
      const memberIds = await getTeamUserIds(s.team_id);
    // ✅ REPLACE lines 350–355 with:
const gradeDisplay = s.final_grade !== null ? `${s.final_grade}/20` : "N/A";
const studentMsg =
  `📋 Project: "${s.project_title}"\n` +
  `🎤 Oral Presentation: ${s.grade_oral ?? "—"}/20\n` +
  `📦 Deliverables Quality: ${s.grade_deliverables ?? "—"}/20\n` +
  `💻 Demo / Application: ${s.grade_demo ?? "—"}/20\n` +
  `❓ Q&A Responses: ${s.grade_qa ?? "—"}/20\n` +
  `⭐ Final Average: ${gradeDisplay}\n` +
  (s.jury_observations ? `📝 Jury observations: ${s.jury_observations}` : "");

for (const uid of memberIds) {
  await sendNotification(uid, "info", "Defense Grade Published", studentMsg);
}

// Notify supervisor
const [supRows] = await db.execute(
  `SELECT p.teacher_id
   FROM assignment a
   JOIN project p ON p.id = a.project_id
   WHERE a.team_id = ? LIMIT 1`,
  [s.team_id]
);
if (supRows.length && supRows[0].teacher_id) {
  await sendNotification(supRows[0].teacher_id, "info", "Defense Grade Published", studentMsg);
}
    }
    res.json({
      message: `${noted.length} soutenance(s) published successfully.`,
      published: noted.length,
    });
  } catch (err) {
    console.error("publishAllGrades error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/grades/bulk-import
 * Import grades from an uploaded .xlsx file.
 * Expected columns (case-insensitive):
 *   soutenance_id | grade_oral | grade_deliverables | grade_demo | grade_qa | jury_observations
 * Multer must be configured in the route (memory storage, field name "file").
 * Roles allowed: super_admin
 */
exports.bulkImportGrades = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Parse Excel from buffer (multer memoryStorage)
    const workbook  = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet     = workbook.Sheets[sheetName];
    const rows      = xlsx.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return res.status(400).json({ message: "Excel file is empty." });
    }

    const updated = [];
    const errors  = [];

    for (const row of rows) {
      // Accept both snake_case and human-readable column headers
      const soutenanceId      = row["soutenance_id"]      ?? row["Soutenance ID"];
      const gradeOral         = row["grade_oral"]         ?? row["Oral Presentation"];
      const gradeDeliverables = row["grade_deliverables"] ?? row["Deliverables Quality"];
      const gradeDemo         = row["grade_demo"]         ?? row["Demo / Application"];
      const gradeQa           = row["grade_qa"]           ?? row["Q&A Responses"];
      const juryObs           = row["jury_observations"]  ?? row["Jury Observations"] ?? "";

      if (!soutenanceId) {
        errors.push({ row, reason: "Missing soutenance_id" });
        continue;
      }

      const oral  = validateGrade(gradeOral);
      const deliv = validateGrade(gradeDeliverables);
      const demo  = validateGrade(gradeDemo);
      const qa    = validateGrade(gradeQa);

      if ([oral, deliv, demo, qa].some((v) => v === null)) {
        errors.push({
          soutenance_id: soutenanceId,
          reason: "Invalid grade values — must be numbers between 0 and 20.",
        });
        continue;
      }

      // Verify soutenance exists and is not already published
      const [existing] = await db.execute(
        "SELECT id, team_id, grade_status FROM soutenance WHERE id = ?",
        [soutenanceId]
      );
      if (!existing.length) {
        errors.push({ soutenance_id: soutenanceId, reason: "Soutenance not found." });
        continue;
      }
      if (existing[0].grade_status === "PUBLISHED") {
        errors.push({ soutenance_id: soutenanceId, reason: "Already published — cannot modify." });
        continue;
      }

      // Update grades
      await db.execute(
        `UPDATE soutenance
         SET grade_oral         = ?,
             grade_deliverables = ?,
             grade_demo         = ?,
             grade_qa           = ?,
             jury_observations  = ?,
             grade_status       = 'NOTED',
             updated_at         = NOW()
         WHERE id = ?`,
        [oral, deliv, demo, qa, juryObs, soutenanceId]
      );

      // Upsert soutenance_result with average
      const average = computeAverage(oral, deliv, demo, qa);
      const [resRow] = await db.execute(
        "SELECT id FROM soutenance_result WHERE soutenance_id = ?",
        [soutenanceId]
      );
      if (resRow.length) {
        await db.execute(
          "UPDATE soutenance_result SET grade = ?, submitted_at = NOW() WHERE soutenance_id = ?",
          [average, soutenanceId]
        );
      } else {
        await db.execute(
          "INSERT INTO soutenance_result (soutenance_id, grade, submitted_at) VALUES (?, ?, NOW())",
          [soutenanceId, average]
        );
      }

      updated.push({ soutenance_id: soutenanceId, average });
    }

    res.json({
      message: `Bulk import complete. ${updated.length} updated, ${errors.length} error(s).`,
      updated,
      errors,
    });
  } catch (err) {
    console.error("bulkImportGrades error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/grades/template
 * Download a pre-filled Excel grade template.
 * Contains all PENDING/NOTED soutenances with their current grades (if any).
 * Roles allowed: super_admin
 */
exports.downloadTemplate = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Fetch all non-published soutenances
    const [soutenances] = await db.execute(
      `SELECT s.id AS soutenance_id,
              p.title AS project_title,
              s.date, s.time, s.room_name,
              s.grade_oral, s.grade_deliverables, s.grade_demo, s.grade_qa,
              s.jury_observations
       FROM soutenance s
       JOIN project p ON p.id = s.project_id
       WHERE s.grade_status IN ('PENDING', 'NOTED')
       ORDER BY s.date ASC`
    );

    const wsData = [
      // Header row
      [
        "soutenance_id",
        "project_title",
        "date",
        "time",
        "room",
        "grade_oral",
        "grade_deliverables",
        "grade_demo",
        "grade_qa",
        "jury_observations",
      ],
      // Data rows
      ...soutenances.map((s) => [
        s.soutenance_id,
        s.project_title,
        s.date        ? String(s.date)        : "",
        s.time        ? String(s.time)        : "",
        s.room_name   ? String(s.room_name)   : "",
        s.grade_oral         ?? "",
        s.grade_deliverables ?? "",
        s.grade_demo         ?? "",
        s.grade_qa           ?? "",
        s.jury_observations  ?? "",
      ]),
    ];

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet(wsData);

    // Set column widths for readability
    ws["!cols"] = [
      { wch: 14 }, // soutenance_id
      { wch: 40 }, // project_title
      { wch: 12 }, // date
      { wch: 8  }, // time
      { wch: 16 }, // room
      { wch: 12 }, // grade_oral
      { wch: 20 }, // grade_deliverables
      { wch: 14 }, // grade_demo
      { wch: 12 }, // grade_qa
      { wch: 40 }, // jury_observations
    ];

    xlsx.utils.book_append_sheet(wb, ws, "Grades");

    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=grades_template.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (err) {
    console.error("downloadTemplate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};