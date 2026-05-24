/**
 * soutenanceController.js
 * Handles the full defense (soutenance) lifecycle:
 *   • Defense request submission (supervisor)
 *   • Request approval / rejection (super_admin) → auto-creates soutenance row
 *   • Soutenance listing / detail / update (date, time, room)
 *   • Notifications via in-app notification table
 */

const db  = require("../config/db");
const { checkRoomConflict } = require("../utils/scheduleConflicts");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

const getUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [rows] = await db.execute(
    "SELECT id, role, first_name, last_name FROM users WHERE id = ?",
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

const getTeamSupervisorId = async (teamId) => {
  const [rows] = await db.execute(
    `SELECT COALESCE(p.teacher_id, p.external_supervisor_id) AS supervisor_id
     FROM assignment a
     JOIN project p ON p.id = a.project_id
     WHERE a.team_id = ? LIMIT 1`,
    [teamId]
  );
  return rows[0]?.supervisor_id || null;
};




// ─────────────────────────────────────────────
//  DEFENSE REQUESTS
// ─────────────────────────────────────────────

/**
 * POST /api/soutenance/requests
 * Supervisor submits a defense authorization request.
 * Requires all 3 deliverables (Final Report, Source Code Repository,
 * Defense Presentation) to be APPROVED.
 */
exports.submitRequest = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    if (!["enseignant", "entreprise", "super_admin"].includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { team_id } = req.body;
    if (!team_id) return res.status(400).json({ message: "team_id is required" });

    // Check all 3 required deliverables are APPROVED
    const REQUIRED = ["Final Report", "Source Code Repository", "Defense Presentation"];
    for (const title of REQUIRED) {
      const [rows] = await db.execute(
        `SELECT status FROM deliverable
         WHERE team_id = ? AND title = ?
         ORDER BY version DESC LIMIT 1`,
        [team_id, title]
      );
      if (!rows.length) {
        return res.status(422).json({ message: `Missing deliverable: "${title}"` });
      }
      if (rows[0].status !== "APPROVED") {
        return res.status(422).json({ message: `Deliverable "${title}" is not yet approved.` });
      }
    }

    // Prevent duplicate active request
    const [existing] = await db.execute(
      "SELECT id, status FROM soutenance_request WHERE team_id = ?",
      [team_id]
    );
    if (existing.length && existing[0].status !== "REJECTED") {
      return res.status(409).json({
        message: "A defense request already exists for this team.",
        status: existing[0].status,
      });
    }

    // Insert or re-submit after rejection
    if (existing.length) {
      await db.execute(
        `UPDATE soutenance_request
         SET status = 'PENDING', comment = NULL, requested_at = NOW(), reviewed_at = NULL
         WHERE team_id = ?`,
        [team_id]
      );
    } else {
      await db.execute(
        `INSERT INTO soutenance_request (team_id, teacher_id, status, requested_at)
         VALUES (?, ?, 'PENDING', NOW())`,
        [team_id, user.id]
      );
    }

    // Notify all super_admins
    const [admins] = await db.execute(
      "SELECT id FROM users WHERE role = 'super_admin' AND is_active = 1"
    );
    for (const admin of admins) {
      await sendNotification(
        admin.id,
        "info",
        "New Defense Authorization Request",
        `${user.first_name} ${user.last_name} submitted a defense request for team #${team_id}.`
      );
    }

    res.status(201).json({ message: "Defense request submitted successfully." });
  } catch (err) {
    console.error("submitRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/soutenance/requests
 * List defense requests filtered by status (default: PENDING).
 * Query: ?status=PENDING|APPROVED|REJECTED
 */
exports.getRequests = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    if (!["super_admin", "admin"].includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status = "PENDING" } = req.query;

    const [rows] = await db.execute(
      `SELECT
         sr.id,
         sr.status,
         sr.comment,
         sr.requested_at,
         sr.reviewed_at,
         t.id  AS team_id,
         COALESCE(p.title, '—') AS project_title,
         CONCAT(u.first_name, ' ', u.last_name) AS teacher_name,
         CONCAT(eu.first_name, ' ', eu.last_name) AS external_supervisor_name,
         (SELECT COUNT(*) FROM deliverable d WHERE d.team_id = t.id AND d.status = 'APPROVED') AS deliverables_count,
         (SELECT COUNT(*) FROM meeting m WHERE m.team_id = t.id AND m.status = 'COMPLETED')    AS completed_meetings
       FROM soutenance_request sr
       JOIN team t        ON t.id  = sr.team_id
       LEFT JOIN assignment a ON a.team_id = t.id
       LEFT JOIN project p    ON p.id = a.project_id
       LEFT JOIN external_supervisor es ON es.id = p.external_supervisor_id
LEFT JOIN users eu               ON eu.id = es.id
       JOIN users u       ON u.id = sr.teacher_id
       WHERE sr.status = ?
       ORDER BY sr.requested_at DESC`,
      [status]
    );

    // Enrich each request with Cloudinary deliverable URLs
   const requests = await Promise.all(
  rows.map(async (row) => {
    const [deliverables] = await db.execute(
      `SELECT title, file_path FROM deliverable
       WHERE team_id = ? AND status = 'APPROVED'
       ORDER BY title`,
      [row.team_id]
    );
    const [members] = await db.execute(
      `SELECT CONCAT(u.first_name, ' ', u.last_name) AS full_name
       FROM team_member tm
       JOIN users u ON u.id = tm.student_id
       WHERE tm.team_id = ? AND tm.status = 'ACCEPTED'
       ORDER BY u.first_name`,
      [row.team_id]
    );
    return { ...row, deliverables, members: members.map(m => m.full_name) };
  })
);

    res.json({ requests });
  } catch (err) {
    console.error("getRequests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/soutenance/requests/team/:teamId
 * Get the defense request for a specific team (used by supervisor).
 */
exports.getRequestByTeam = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    await getUserFromToken(token);
    const { teamId } = req.params;

    const [rows] = await db.execute(
      "SELECT * FROM soutenance_request WHERE team_id = ? LIMIT 1",
      [teamId]
    );

    res.json({ request: rows[0] || null });
  } catch (err) {
    console.error("getRequestByTeam error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /api/soutenance/requests/:id/approve
 * Approve a defense request.
 * Automatically creates a soutenance row so jury can be assigned immediately.
 * Returns { soutenanceId } so the frontend can store it.
 */
exports.approveRequest = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;

    // Fetch the request
    const [reqRows] = await db.execute(
      "SELECT * FROM soutenance_request WHERE id = ?",
      [id]
    );
    if (!reqRows.length) {
      return res.status(404).json({ message: "Request not found." });
    }
    const sr = reqRows[0];
    if (sr.status !== "PENDING") {
      return res.status(409).json({ message: "Request is not in PENDING state." });
    }

    // Update request status
    await db.execute(
      `UPDATE soutenance_request
       SET status = 'APPROVED', reviewed_at = NOW(), reviewed_by = ?
       WHERE id = ?`,
      [user.id, id]
    );

    // Auto-create soutenance row if it doesn't exist yet
    const [existingSout] = await db.execute(
      "SELECT id FROM soutenance WHERE team_id = ?",
      [sr.team_id]
    );

    let soutenanceId;
    if (existingSout.length) {
      soutenanceId = existingSout[0].id;
    } else {
      // Get project_id from assignment
      const [proj] = await db.execute(
        "SELECT project_id FROM assignment WHERE team_id = ? LIMIT 1",
        [sr.team_id]
      );
      const projectId = proj[0]?.project_id || null;

      const [ins] = await db.execute(
        `INSERT INTO soutenance (project_id, team_id, status, grade_status, created_by, updated_at)
         VALUES (?, ?, 'SCHEDULED', 'PENDING', ?, NOW())`,
        [projectId, sr.team_id, user.id]
      );
      soutenanceId = ins.insertId;
    }

    // Notify the supervisor who submitted the request
    // Fetch project title
    const [projRows] = await db.execute(
      `SELECT p.title FROM assignment a JOIN project p ON p.id = a.project_id WHERE a.team_id = ? LIMIT 1`,
      [sr.team_id]
    );
    const projectTitle = projRows[0]?.title || "—";

    // Fetch supervisor name
    const [supRows] = await db.execute(
      `SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM users WHERE id = ?`,
      [sr.teacher_id]
    );
    const supervisorName = supRows[0]?.full_name || "—";

    // Fetch team member names
    const [tmRows] = await db.execute(
      `SELECT CONCAT(u.first_name, ' ', u.last_name) AS full_name
       FROM team_member tm JOIN users u ON u.id = tm.student_id
       WHERE tm.team_id = ? AND tm.status = 'ACCEPTED'`,
      [sr.team_id]
    );
    const teamMembersStr = tmRows.map(m => m.full_name).join(", ") || "—";

    const approvalMsg =
      `Your defense request for team #${sr.team_id} has been approved.\n` +
     `📋 Project: ${projectTitle}\n` +
     `⚙️ Jury assignment is now in progress.`;

    // Notify supervisor
    await sendNotification(sr.teacher_id, "info", "Defense Request Approved", approvalMsg);
    const [extSupApprove] = await db.execute(
  `SELECT p.external_supervisor_id
   FROM assignment a JOIN project p ON p.id = a.project_id
   WHERE a.team_id = ? LIMIT 1`,
  [sr.team_id]
);
const extIdApprove = extSupApprove[0]?.external_supervisor_id || null;
if (extIdApprove) {
  await sendNotification(extIdApprove, "info", "Defense Request Approved", approvalMsg);
}

    res.json({ message: "Request approved.", soutenanceId });
  } catch (err) {
    console.error("approveRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /api/soutenance/requests/:id/reject
 * Reject a defense request with an optional comment.
 */
exports.rejectRequest = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const { comment } = req.body;

    const [reqRows] = await db.execute(
      "SELECT * FROM soutenance_request WHERE id = ?",
      [id]
    );
    if (!reqRows.length) {
      return res.status(404).json({ message: "Request not found." });
    }
    const sr = reqRows[0];

    await db.execute(
      `UPDATE soutenance_request
       SET status = 'REJECTED', comment = ?, reviewed_at = NOW(), reviewed_by = ?
       WHERE id = ?`,
      [comment || null, user.id, id]
    );

    // Notify supervisor
const commentText = comment ? `\nReason: ${comment}` : "";
await sendNotification(
  sr.teacher_id,
  "alert",
  "Defense Request Rejected",
  `Your defense request for team #${sr.team_id} has been rejected.${commentText}`
);

const [extSupReject] = await db.execute(
  `SELECT p.external_supervisor_id
   FROM assignment a JOIN project p ON p.id = a.project_id
   WHERE a.team_id = ? LIMIT 1`,
  [sr.team_id]
);
const extIdReject = extSupReject[0]?.external_supervisor_id || null;
if (extIdReject) {
  await sendNotification(
    extIdReject, "alert", "Defense Request Rejected",
    `The defense request for team #${sr.team_id} has been rejected.${commentText}`
  );
}


    res.json({ message: "Request rejected." });
  } catch (err) {
    console.error("rejectRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────
//  SOUTENANCE CRUD
// ─────────────────────────────────────────────

/**
 * GET /api/soutenance
 * List all soutenances with project title, team info, jury count, grade status.
 * Query: ?status=SCHEDULED|COMPLETED  ?grade_status=PENDING|NOTED|PUBLISHED
 */
exports.getSoutenances = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    if (!["super_admin", "admin"].includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const conditions = [];
    const params = [];

    if (req.query.status) {
      conditions.push("s.status = ?");
      params.push(req.query.status);
    }
    if (req.query.grade_status) {
      conditions.push("s.grade_status = ?");
      params.push(req.query.grade_status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // AFTER — leader_name uses a safe subquery, no unstable JOIN
const [rows] = await db.execute(
  `SELECT
     s.id,
     s.team_id,
     s.project_id,
     s.status,
     s.grade_status,
     s.date,
     s.time,
     s.room_name,
     s.grade_oral,
     s.grade_deliverables,
     s.grade_demo,
     s.grade_qa,
     s.jury_observations,
     s.jury_notified,
     s.updated_at,
     COALESCE(p.title, '—') AS project_title,
     (SELECT CONCAT(u2.first_name, ' ', u2.last_name)
      FROM team_member tm2
      JOIN users u2 ON u2.id = tm2.student_id
      WHERE tm2.team_id = s.team_id AND tm2.status = 'ACCEPTED'
      LIMIT 1) AS leader_name,
     sr.grade AS final_grade,
      (SELECT COUNT(*) FROM soutenance_jury sj WHERE sj.soutenance_id = s.id) AS jury_count,
     (SELECT CONCAT(u.first_name, ' ', u.last_name)
      FROM project p2
      JOIN users u ON u.id = COALESCE(p2.teacher_id, p2.external_supervisor_id)
      WHERE p2.id = s.project_id
      LIMIT 1) AS supervisor_name
   FROM soutenance s
   LEFT JOIN project p ON p.id = s.project_id
   LEFT JOIN soutenance_result sr ON sr.soutenance_id = s.id
   ${where}
   ORDER BY s.date ASC, s.time ASC`,
  params
  );
         

    res.json({ soutenances: rows });
  } catch (err) {
    console.error("getSoutenances error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/soutenance/:id
 * Get a single soutenance with full detail including jury members and deliverables.
 */
exports.getSoutenanceById = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    await getUserFromToken(token);
    const { id } = req.params;

    const [rows] = await db.execute(
      `SELECT s.*, COALESCE(p.title, '—') AS project_title, sr.grade AS final_grade
       FROM soutenance s
       LEFT JOIN project p ON p.id = s.project_id
       LEFT JOIN soutenance_result sr ON sr.soutenance_id = s.id
       WHERE s.id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: "Soutenance not found." });

    const sout = rows[0];

    // Jury members
    const [jury] = await db.execute(
      `SELECT id, full_name, email, role, added_at
       FROM soutenance_jury
       WHERE soutenance_id = ?
       ORDER BY FIELD(role, 'PRESIDENT', 'RAPPORTEUR', 'EXAMINER'), added_at ASC`,
      [id]
    );

    // Deliverables (Cloudinary URLs)
    const [deliverables] = await db.execute(
      `SELECT title, file_path FROM deliverable
       WHERE team_id = ? AND status = 'APPROVED'
       ORDER BY title`,
      [sout.team_id]
    );

    res.json({ soutenance: { ...sout, jury, deliverables } });
  } catch (err) {
    console.error("getSoutenanceById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/soutenance/:id
 * Update the date, time, and room of a soutenance.
 * Triggers a re-notification to jury and team members.
 */
exports.updateSoutenance = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const { date, time, room_name } = req.body;

    const [rows] = await db.execute(
      "SELECT * FROM soutenance WHERE id = ?",
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: "Soutenance not found." });

   // ── Room conflict check ──
    const effectiveDate = date      || rows[0].date;
    const effectiveTime = time      || rows[0].time;
    const effectiveRoom = room_name || rows[0].room_name;

    if (effectiveDate && effectiveTime && effectiveRoom) {
      const roomConflict = await checkRoomConflict(effectiveRoom, effectiveDate, effectiveTime, id);
      if (roomConflict) {
        return res.status(409).json({
          message: `Room "${effectiveRoom}" is already booked on this date at ${roomConflict.time}. A defense takes 2 hours — please choose a different room or time.`,
        });
      }
    }

    // ── Jury schedule conflict check ──
    // If date or time is being changed, verify no jury member has another defense
    // within 2 hours of the new time
    if (effectiveDate && effectiveTime) {
      const [juryMembers] = await db.execute(
        `SELECT teacher_id, full_name, role
         FROM soutenance_jury
         WHERE soutenance_id = ? AND teacher_id IS NOT NULL`,
        [id]
      );

      for (const member of juryMembers) {
        const [juryConflict] = await db.execute(
          `SELECT s.time, sj.role
           FROM soutenance_jury sj
           JOIN soutenance s ON s.id = sj.soutenance_id
           WHERE sj.teacher_id = ?
             AND sj.soutenance_id != ?
             AND DATE(s.date) = DATE(?)
             AND ABS(
                   TIMESTAMPDIFF(MINUTE,
                     CONCAT(DATE(?), ' ', s.time),
                     CONCAT(DATE(?), ' ', ?)
                   )
                 ) < 120`,
          [member.teacher_id, parseInt(id), effectiveDate, effectiveDate, effectiveDate, effectiveTime]
        );

        if (juryConflict.length) {
          return res.status(409).json({
            message: `Jury member "${member.full_name}" (${member.role}) already has another defense on this date at ${juryConflict[0].time}. A defense takes 2 hours — please choose a different time.`,
          });
        }
      }
    }

await db.execute(
  `UPDATE soutenance
   SET date = COALESCE(?, date),
       time = COALESCE(?, time),
       room_name = COALESCE(?, room_name),
       updated_at = NOW()
   WHERE id = ?`,
  [date || null, time || null, room_name || null, id]
);

  

   const s = rows[0];

    // Use effective values (what was actually saved)
    const finalDate = date      || s.date;
    const finalTime = time      || s.time;
    const finalRoom = room_name || s.room_name;

    // Format date for display
    const formattedDate = finalDate
      ? new Date(finalDate).toLocaleDateString("en-GB", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        })
      : "—";

    // Fetch project title
    const [projRows] = await db.execute(
      "SELECT title FROM project WHERE id = ?",
      [s.project_id]
    );
    const projectTitle = projRows[0]?.title || "—";

    // Fetch team members (for in-app notification + email)
    const [teamMembersRows] = await db.execute(
      `SELECT u.id, u.email, CONCAT(u.first_name, ' ', u.last_name) AS full_name
       FROM team_member tm
       JOIN users u ON u.id = tm.student_id
       WHERE tm.team_id = ? AND tm.status = 'ACCEPTED'`,
      [s.team_id]
    );

    // Fetch jury members (for in-app notification + email, includes INVITEUR)
    const [juryRows] = await db.execute(
      "SELECT full_name, email, role FROM soutenance_jury WHERE soutenance_id = ?",
      [id]
    );

    // Fetch supervisor id, name, email
    const supervisorId = await getTeamSupervisorId(s.team_id);
    let supervisorEmail = null;
    let supervisorName  = "—";
    if (supervisorId) {
      const [supRow] = await db.execute(
        `SELECT u.email, CONCAT(u.first_name, ' ', u.last_name) AS full_name
         FROM users u WHERE u.id = ?`,
        [supervisorId]
      );
      supervisorEmail = supRow[0]?.email || null;
      supervisorName  = supRow[0]?.full_name || "—";
    }

    // ── In-app notifications ──
    const scheduleMsg =
      `📋 Project: ${projectTitle}\n` +
      `📅 Date: ${formattedDate}\n` +
      `🕐 Time: ${finalTime}\n` +
      `📍 Room: ${finalRoom}`;

    // Notify team students
    for (const member of teamMembersRows) {
      await sendNotification(member.id, "info", "Defense Schedule Updated", scheduleMsg);
    }
    // Notify supervisor
    if (supervisorId) {
      await sendNotification(supervisorId, "info", "Defense Schedule Updated", scheduleMsg);
    }
    const [extSupUpdate] = await db.execute(
  `SELECT p.external_supervisor_id
   FROM assignment a JOIN project p ON p.id = a.project_id
   WHERE a.team_id = ? LIMIT 1`,
  [s.team_id]
);
const extIdUpdate = extSupUpdate[0]?.external_supervisor_id || null;
if (extIdUpdate) {
  await sendNotification(extIdUpdate, "info", "Defense Schedule Updated", scheduleMsg);
}

    // ── Email builder ──
    const buildEmail = (recipientName, roleLabel) => `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
         style="background-color:#f0f4f8;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600"
             style="max-width:600px;width:100%;background:#ffffff;border-radius:10px;
                    overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#193962,#2D8FBF);padding:32px 40px 24px;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">⚠️ Defense Schedule Updated</h1>
            <p style="margin:4px 0 0;color:#c8dff0;font-size:13px;">The defense session has been rescheduled.</p>
          </td>
        </tr>
        <!-- Role badge -->
        <tr>
          <td style="background:#eaf2fb;padding:12px 40px;border-bottom:1px solid #dce8f3;">
            <p style="margin:0;font-size:13px;color:#555555;">
              Dear <strong>${recipientName}</strong>&nbsp;—&nbsp;
              <span style="background:#193962;color:#fff;font-size:11px;font-weight:700;
                           padding:3px 12px;border-radius:20px;">${roleLabel}</span>
            </p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:28px 40px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                   style="background:#f8fafc;border:1px solid #dce8f3;border-radius:8px;margin-bottom:20px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#2D8FBF;
                             text-transform:uppercase;letter-spacing:1.5px;">Updated Defense Details</p>
                  <table role="presentation" cellpadding="4" cellspacing="0" width="100%">
                    <tr>
                      <td style="font-size:13px;color:#555;width:120px;">📋 Project</td>
                      <td style="font-size:13px;color:#193962;font-weight:600;">${projectTitle}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#555;">📅 Date</td>
                      <td style="font-size:13px;color:#193962;font-weight:600;">${formattedDate}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#555;">🕐 Time</td>
                      <td style="font-size:13px;color:#193962;font-weight:600;">${finalTime}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#555;">📍 Room</td>
                      <td style="font-size:13px;color:#193962;font-weight:600;">${finalRoom}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <p style="font-size:13px;color:#555;padding:12px 16px;background:#fffbeb;
                      border-left:3px solid #f59e0b;border-radius:4px;margin:0;">
              ⚠️ Please note the updated schedule and adjust your availability accordingly.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f4f7fb;border-top:1px solid #dce8f3;padding:16px 40px;">
            <p style="margin:0;font-size:11px;color:#999;">
              Automated notification from
              <strong style="color:#193962;">ESI-SBA PFE Platform</strong>. Do not reply.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    // ── Send emails to jury (PRESIDENT, EXAMINER, INVITEUR) ──
    for (const member of juryRows) {
      const roleLabel = member.role === "PRESIDENT"   ? "President"
                      : member.role === "EXAMINER"    ? "Examiner"
                      : member.role === "INVITEUR"    ? "Invited Guest"
                      : member.role;
      try {
        await transporter.sendMail({
          from:    `"ESI-SBA PFE Platform" <${process.env.SMTP_USER}>`,
          to:      member.email,
          subject: `Defense Schedule Updated – ${projectTitle} | ESI-SBA PFE`,
          html:    buildEmail(member.full_name, roleLabel),
        });
      } catch (mailErr) {
        console.error(`Failed to send update email to jury ${member.email}:`, mailErr.message);
      }
    }

    // ── Send emails to team students ──
    for (const member of teamMembersRows) {
      try {
        await transporter.sendMail({
          from:    `"ESI-SBA PFE Platform" <${process.env.SMTP_USER}>`,
          to:      member.email,
          subject: `Defense Schedule Updated – ${projectTitle} | ESI-SBA PFE`,
          html:    buildEmail(member.full_name, "Team Member"),
        });
      } catch (mailErr) {
        console.error(`Failed to send update email to student ${member.email}:`, mailErr.message);
      }
    }

    // ── Send email to supervisor ──
    if (supervisorEmail) {
      try {
        await transporter.sendMail({
          from:    `"ESI-SBA PFE Platform" <${process.env.SMTP_USER}>`,
          to:      supervisorEmail,
          subject: `Defense Schedule Updated – ${projectTitle} | ESI-SBA PFE`,
          html:    buildEmail(supervisorName, "Supervisor"),
        });
      } catch (mailErr) {
        console.error(`Failed to send update email to supervisor ${supervisorEmail}:`, mailErr.message);
      }
    }

   res.json({ message: "Soutenance updated. Jury, team, and supervisor notified." });
  } catch (err) {
    console.error("updateSoutenance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// PUT /api/soutenance/:id/schedule   ← NEW endpoint for first-time scheduling
// Notifies supervisor + team members only. No jury email.
// ─────────────────────────────────────────────
exports.scheduleSoutenance = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const { date, time, room_name } = req.body;

    const [rows] = await db.execute("SELECT * FROM soutenance WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Soutenance not found." });

    

    // Fetch team member names (for notification message)
    // ── Room conflict check ──
    const newDate = date      || rows[0].date;
    const newTime = time      || rows[0].time;
    const newRoom = room_name || rows[0].room_name;

    if (newDate && newTime && newRoom) {
      const roomConflict = await checkRoomConflict(newRoom, newDate, newTime, id);
      if (roomConflict) {
        return res.status(409).json({
          message: `Room "${newRoom}" is already booked on this date at ${roomConflict.time}. A defense takes 2 hours — please choose a different room or time.`,
        });
      }
    }

    await db.execute(
      `UPDATE soutenance
       SET date = COALESCE(?, date),
           time = COALESCE(?, time),
           room_name = COALESCE(?, room_name),
           updated_at = NOW()
       WHERE id = ?`,
      [date || null, time || null, room_name || null, id]
    );

    const s = rows[0];

    // Fetch project title
    const [projRows] = await db.execute("SELECT title FROM project WHERE id = ?", [s.project_id]);
    const projectTitle = projRows[0]?.title || "—";

    // Fetch supervisor id and name
    const supervisorId = await getTeamSupervisorId(s.team_id);
    const [supervisorRow] = await db.execute(
      `SELECT CONCAT(u.first_name, ' ', u.last_name) AS full_name FROM users u WHERE u.id = ?`,
      [supervisorId]
    );
    const supervisorName = supervisorRow[0]?.full_name || "—";

    // Fetch team member names (for notification message)
    const [tmRows] = await db.execute(
      `SELECT CONCAT(u.first_name, ' ', u.last_name) AS full_name
       FROM team_member tm JOIN users u ON u.id = tm.student_id
       WHERE tm.team_id = ? AND tm.status = 'ACCEPTED'`,
      [s.team_id]
    );
    const teamMembersStr = tmRows.map(m => m.full_name).join(", ") || "—";

    const formattedDate = newDate
      ? new Date(newDate).toLocaleDateString("en-GB", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        })
      : "—";

    const scheduleMsg =
      `📋 Project: ${projectTitle}\n` +
      `👤 Supervisor: ${supervisorName}\n` +
      `👥 Team #${s.team_id} — Members: ${teamMembersStr}\n` +
      `📅 Date: ${formattedDate}\n` +
      `🕐 Time: ${newTime}\n` +
      `📍 Room: ${newRoom}`;

    // Notify team members
    const memberIds = await getTeamUserIds(s.team_id);
    for (const uid of memberIds) {
      await sendNotification(uid, "info", "New Defense Schedule", scheduleMsg);
    }
    // Notify supervisor
    if (supervisorId) {
      await sendNotification(supervisorId, "info", "New Defense Schedule", scheduleMsg);
    }
    const [extSupSched] = await db.execute(
  `SELECT p.external_supervisor_id
   FROM assignment a JOIN project p ON p.id = a.project_id
   WHERE a.team_id = ? LIMIT 1`,
  [s.team_id]
);
const extIdSched = extSupSched[0]?.external_supervisor_id || null;
if (extIdSched) {
  await sendNotification(extIdSched, "info", "New Defense Schedule", scheduleMsg);
}

    // ✅ NO jury email sent here

    res.json({ message: "Defense scheduled. Supervisor and team notified." });
  } catch (err) {
    console.error("scheduleSoutenance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/soutenance
 * Manually create a soutenance (only needed if not auto-created on approval).
 */
exports.createSoutenance = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { team_id, date, time, room_name } = req.body;
    if (!team_id) return res.status(400).json({ message: "team_id is required." });

    // Check there is an approved request for this team
    const [reqRows] = await db.execute(
      "SELECT id FROM soutenance_request WHERE team_id = ? AND status = 'APPROVED'",
      [team_id]
    );
    if (!reqRows.length) {
      return res.status(422).json({ message: "No approved defense request found for this team." });
    }

    // Prevent duplicates
    const [existing] = await db.execute(
      "SELECT id FROM soutenance WHERE team_id = ?",
      [team_id]
    );
    if (existing.length) {
      return res.status(409).json({ message: "A soutenance already exists for this team.", soutenanceId: existing[0].id });
    }

    const [proj] = await db.execute(
      "SELECT project_id FROM assignment WHERE team_id = ? LIMIT 1",
      [team_id]
    );
    const projectId = proj[0]?.project_id || null;

    const [ins] = await db.execute(
      `INSERT INTO soutenance (project_id, team_id, status, grade_status, date, time, room_name, created_by, updated_at)
       VALUES (?, ?, 'SCHEDULED', 'PENDING', ?, ?, ?, ?, NOW())`,
      [projectId, team_id, date || null, time || null, room_name || null, user.id]
    );

    res.status(201).json({ message: "Soutenance created.", soutenanceId: ins.insertId });
  } catch (err) {
    console.error("createSoutenance error:", err);
    res.status(500).json({ message: "Server error" });
  }
}; 

// ──────────────────────────────────────────────────────────────────────────────
//  ADD THIS TO soutenanceController.js
// ──────────────────────────────────────────────────────────────────────────────
 
/**
 * GET /api/soutenance/my-result
 * Returns the published soutenance result for the currently logged-in student.
 * Includes: project title, team members, supervisor, date, room,
 *           grade_oral, grade_demo, grade_qa, grade_deliverables,
 *           jury_observations, jury members.
 */
exports.getMyResult = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });
 
  try {
    const user = await getUserFromToken(token);
 
    // 1. Find the team the student belongs to (accepted membership)
    const [teamRows] = await db.execute(
      `SELECT tm.team_id
       FROM team_member tm
       WHERE tm.student_id = ? AND tm.status = 'ACCEPTED'
       LIMIT 1`,
      [user.id]
    );
 
    if (!teamRows.length) {
      return res.status(404).json({ message: "You are not part of any team." });
    }
 
    const teamId = teamRows[0].team_id;
 
    // 2. Find the soutenance for that team (must be PUBLISHED)
    const [soutRows] = await db.execute(
      `SELECT
         s.id,
         s.team_id,
         s.project_id,
         s.status,
         s.grade_status,
         s.date,
         s.time,
         s.room_name,
         s.grade_oral,
         s.grade_deliverables,
         s.grade_demo,
         s.grade_qa,
         s.jury_observations,
         COALESCE(p.title, '—') AS project_title,
         sr.grade              AS final_grade,
         -- Supervisor name from project
         (SELECT CONCAT(u2.first_name, ' ', u2.last_name)
          FROM users u2
          WHERE u2.id = COALESCE(p.teacher_id, p.external_supervisor_id)
          LIMIT 1) AS supervisor_name
       FROM soutenance s
       LEFT JOIN project p          ON p.id = s.project_id
       LEFT JOIN soutenance_result sr ON sr.soutenance_id = s.id
       WHERE s.team_id = ?
         AND s.grade_status = 'PUBLISHED'
       LIMIT 1`,
      [teamId]
    );
 
    if (!soutRows.length) {
      // Return the row even if not published yet, so frontend can show "pending"
      const [pendingRows] = await db.execute(
        `SELECT s.grade_status, s.team_id
         FROM soutenance s WHERE s.team_id = ? LIMIT 1`,
        [teamId]
      );
      if (pendingRows.length) {
        return res.status(200).json({ result: pendingRows[0] }); // grade_status ≠ PUBLISHED
      }
      return res.status(404).json({ message: "No defense result found." });
    }
 
    const sout = soutRows[0];
 
    // 3. Fetch team members
    const [memberRows] = await db.execute(
      `SELECT
         CONCAT(u.first_name, ' ', u.last_name) AS full_name,
         u.id
       FROM team_member tm
       JOIN users u ON u.id = tm.student_id
       WHERE tm.team_id = ? AND tm.status = 'ACCEPTED'
       ORDER BY u.first_name`,
      [teamId]
    );
 
    const members = memberRows.map(m => ({
      full_name: m.full_name,
      is_current_user: m.id === user.id,
    }));
 
    // 4. Fetch jury members
    const [juryRows] = await db.execute(
      `SELECT full_name, role
       FROM soutenance_jury
       WHERE soutenance_id = ?
       ORDER BY FIELD(role, 'PRESIDENT', 'RAPPORTEUR', 'EXAMINER')`,
      [sout.id]
    );
 
    // 5. Return assembled result
    res.json({
      result: {
        ...sout,
        members,
        jury: juryRows,
      },
    });
  } catch (err) {
    console.error("getMyResult error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
/**
 * PATCH /api/soutenance/:id/publish
 * Super-admin publishes the result → sets grade_status = 'PUBLISHED'
 * and sends an in-app notification to every team member.
 */
exports.publishResult = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;

    // Fetch soutenance
    const [rows] = await db.execute(
      `SELECT s.*, COALESCE(p.title, '—') AS project_title
       FROM soutenance s
       LEFT JOIN project p ON p.id = s.project_id
       WHERE s.id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: "Soutenance not found." });

    const s = rows[0];

    // Set grade_status to PUBLISHED
    await db.execute(
      `UPDATE soutenance SET grade_status = 'PUBLISHED', updated_at = NOW() WHERE id = ?`,
      [id]
    );

    // Notify every accepted team member
    const memberIds = await getTeamUserIds(s.team_id);
    for (const uid of memberIds) {
      await sendNotification(
        uid,
        "success",
        "Your Defense Results Are Published!",
        `🎓 The results for "${s.project_title}" have been published. Check your Results page now.`
      );
    }

    const [extSupPublish] = await db.execute(
  `SELECT p.external_supervisor_id
   FROM assignment a JOIN project p ON p.id = a.project_id
   WHERE a.team_id = ? LIMIT 1`,
  [s.team_id]
);
const extIdPublish = extSupPublish[0]?.external_supervisor_id || null;
if (extIdPublish) {
  await sendNotification(
    extIdPublish, "info", "Defense Results Published",
    `🎓 The results for "${s.project_title}" have been published.`
  );
}

    res.json({ message: "Result published and students notified." });
  } catch (err) {
    console.error("publishResult error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
