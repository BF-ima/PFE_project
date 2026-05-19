/**
 * juryController.js
 * Manages jury members attached to a soutenance:
 *   • Add / list / update / remove members
 *   • notifyJury → sends real HTML emails (Nodemailer) with schedule +
 *     Cloudinary deliverable links, plus in-app notifications
 *
 * Requires:  npm install nodemailer
 * .env vars: SMTP_HOST  SMTP_PORT  SMTP_USER  SMTP_PASS
 */

const db       = require("../config/db");
const jwt      = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// ─────────────────────────────────────────────
//  Nodemailer transporter
// ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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

const getSoutenanceTeamId = async (soutenanceId) => {
  const [rows] = await db.execute(
    "SELECT team_id FROM soutenance WHERE id = ? LIMIT 1",
    [soutenanceId]
  );
  return rows[0]?.team_id || null;
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
//  JURY MEMBER ENDPOINTS
// ─────────────────────────────────────────────

/**
 * POST /api/jury/:soutenanceId/members
 * Add a jury member to a soutenance.
 * Body: { full_name, email, role: PRESIDENT|RAPPORTEUR|EXAMINER }
 * Roles allowed: super_admin
 */
exports.addJuryMember = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { soutenanceId } = req.params;
    const { full_name, email, role = "EXAMINER" } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({ message: "full_name and email are required." });
    }

    const validRoles = ["PRESIDENT", "RAPPORTEUR", "EXAMINER"];
    const normalizedRole = role.toUpperCase();
    if (!validRoles.includes(normalizedRole)) {
      return res.status(400).json({
        message: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    // Verify soutenance exists
    const [sout] = await db.execute(
      "SELECT id FROM soutenance WHERE id = ?",
      [soutenanceId]
    );
    if (!sout.length) {
      return res.status(404).json({ message: "Soutenance not found." });
    }

    // PRESIDENT and RAPPORTEUR must be unique per soutenance
    if (["PRESIDENT", "RAPPORTEUR"].includes(normalizedRole)) {
      const [dup] = await db.execute(
        "SELECT id FROM soutenance_jury WHERE soutenance_id = ? AND role = ?",
        [soutenanceId, normalizedRole]
      );
      if (dup.length) {
        return res.status(409).json({
          message: `A ${normalizedRole} already exists for this soutenance.`,
        });
      }
    }

    const [result] = await db.execute(
      `INSERT INTO soutenance_jury (soutenance_id, full_name, email, role)
       VALUES (?, ?, ?, ?)`,
      [soutenanceId, full_name, email.toLowerCase().trim(), normalizedRole]
    );

    res.status(201).json({
      message: "Jury member added.",
      member: { id: result.insertId, full_name, email, role: normalizedRole },
    });
  } catch (err) {
    console.error("addJuryMember error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/jury/:soutenanceId/members
 * List all jury members for a soutenance.
 * Order: PRESIDENT → RAPORTEUR → EXAMINER
 */
exports.getJuryMembers = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    await getUserFromToken(token);
    const { soutenanceId } = req.params;

    const [rows] = await db.execute(
      `SELECT id, full_name, email, role, added_at
       FROM soutenance_jury
       WHERE soutenance_id = ?
       ORDER BY FIELD(role, 'PRESIDENT', 'RAPPORTEUR', 'EXAMINER'), added_at ASC`,
      [soutenanceId]
    );

    res.json({ jury: rows });
  } catch (err) {
    console.error("getJuryMembers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/jury/:soutenanceId/members/:memberId
 * Remove a jury member.
 * Roles allowed: super_admin
 */
exports.removeJuryMember = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { soutenanceId, memberId } = req.params;

    const [rows] = await db.execute(
      "SELECT id FROM soutenance_jury WHERE id = ? AND soutenance_id = ?",
      [memberId, soutenanceId]
    );
    if (!rows.length) {
      return res.status(404).json({ message: "Jury member not found." });
    }

    await db.execute("DELETE FROM soutenance_jury WHERE id = ?", [memberId]);

    res.json({ message: "Jury member removed." });
  } catch (err) {
    console.error("removeJuryMember error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /api/jury/:soutenanceId/members/:memberId
 * Update a jury member's details or role.
 * Roles allowed: super_admin
 */
exports.updateJuryMember = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { soutenanceId, memberId } = req.params;
    const { full_name, email, role } = req.body;

    const [rows] = await db.execute(
      "SELECT * FROM soutenance_jury WHERE id = ? AND soutenance_id = ?",
      [memberId, soutenanceId]
    );
    if (!rows.length) {
      return res.status(404).json({ message: "Jury member not found." });
    }

    const member = rows[0];
    const newRole = role ? role.toUpperCase() : member.role;

    // Check uniqueness for PRESIDENT / RAPORTEUR if role changed
    if (["PRESIDENT", "RAPPORTEUR"].includes(newRole) && newRole !== member.role) {
      const [dup] = await db.execute(
        "SELECT id FROM soutenance_jury WHERE soutenance_id = ? AND role = ? AND id != ?",
        [soutenanceId, newRole, memberId]
      );
      if (dup.length) {
        return res.status(409).json({
          message: `A ${newRole} already exists for this soutenance.`,
        });
      }
    }

    await db.execute(
      `UPDATE soutenance_jury
       SET full_name = COALESCE(?, full_name),
           email     = COALESCE(?, email),
           role      = ?
       WHERE id = ?`,
      [full_name || null, email || null, newRole, memberId]
    );

    res.json({ message: "Jury member updated." });
  } catch (err) {
    console.error("updateJuryMember error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/jury/:soutenanceId/notify
 * Send real HTML emails to every jury member with:
 *   - Defense date / time / room
 *   - Team deliverable links (Cloudinary URLs from the deliverable table)
 * Also sends in-app notifications to jury + team members + supervisor.
 * Roles allowed: super_admin
 */
exports.notifyJury = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { soutenanceId } = req.params;

    // Fetch soutenance with project title
    const [sout] = await db.execute(
      `SELECT s.*, p.title AS project_title
       FROM soutenance s
       JOIN project p ON p.id = s.project_id
       WHERE s.id = ?`,
      [soutenanceId]
    );
    if (!sout.length) {
      return res.status(404).json({ message: "Soutenance not found." });
    }
    const s = sout[0];
    if (s.jury_notified === 1) {
  return res.status(409).json({
    message: "Jury has already been approved and notified. This action cannot be repeated.",
  });
}

    const formattedDate = s.date
  ? new Date(s.date).toLocaleDateString("en-GB", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    })
  : "—";

    // Validate that date/time/room are set before notifying
    if (!s.date || !s.time || !s.room_name) {
      return res.status(422).json({
        message: "Defense must have a date, time, and room set before notifying the jury.",
      });
    }

    // Fetch approved deliverables with Cloudinary URLs
    const [deliverables] = await db.execute(
      `SELECT title, file_path FROM deliverable
       WHERE team_id = ? AND status = 'APPROVED'
       ORDER BY title`,
      [s.team_id]
    );

const getDeliverableIcon = (title, url) => {
  if (url?.includes("github.com")) return "🔗";
  const t = title?.toLowerCase() || "";
  if (t.includes("report") || url?.endsWith(".pdf")) return "📄";
  if (t.includes("presentation") || url?.match(/\.(ppt|pptx)$/)) return "📊";
  return "📁";
};

const deliverableLinksHtml = deliverables.length
  ? `<h3 style="color:#193962;margin-top:24px;margin-bottom:8px;">Team Deliverables</h3>
     <ul style="padding-left:0;list-style:none;margin:0;">
       ${deliverables.map((d) => {
         const icon = getDeliverableIcon(d.title, d.file_path);
         const isGithub = d.file_path?.includes("github.com");
         return `<li style="margin-bottom:10px;display:flex;align-items:center;gap:8px;">
           <span style="font-size:16px;">${icon}</span>
           <a href="${d.file_path}" target="_blank"
              style="color:#2D8FBF;text-decoration:none;font-weight:500;font-size:14px;">
             ${d.title}${isGithub ? " (GitHub Repository)" : ""}
           </a>
         </li>`;
       }).join("")}
     </ul>`
  : `<p style="color:#888;font-size:13px;">No deliverables available yet.</p>`;

    const deliverablePlainText = deliverables.length
      ? "\n\nTeam Deliverables:\n" +
        deliverables.map((d) => `  • ${d.title}: ${d.file_path}`).join("\n")
      : "";

    // Fetch all jury members
    const [juryRows] = await db.execute(
      "SELECT full_name, email, role FROM soutenance_jury WHERE soutenance_id = ?",
      [soutenanceId]
    );
    if (!juryRows.length) {
  return res.status(422).json({
    message: "No jury members found for this soutenance. Add members first.",
  });
}

// Validate exactly 1 PRESIDENT, 1 RAPPORTEUR, 1 EXAMINER (no duplicates allowed)
const roles = juryRows.map(j => j.role);
const missingRoles = ["PRESIDENT", "RAPPORTEUR", "EXAMINER"].filter(r => !roles.includes(r));
if (missingRoles.length > 0) {
  return res.status(422).json({
    message: `Cannot approve jury: missing role(s) — ${missingRoles.join(", ")}. All three (PRESIDENT, RAPPORTEUR, EXAMINER) are required.`,
  });
}
const duplicateRoles = ["PRESIDENT", "RAPPORTEUR", "EXAMINER"].filter(
  r => roles.filter(x => x === r).length > 1
);
if (duplicateRoles.length > 0) {
  return res.status(422).json({
    message: `Cannot approve jury: duplicate role(s) — ${duplicateRoles.join(", ")}. Each role must appear exactly once.`,
  });
}
   

    // Send HTML email to each jury member
    // ── ADD HERE (before line 355, before the email loop) ─────────────────

const teamId = s.team_id;
const memberIds = teamId ? await getTeamUserIds(teamId) : [];
const supervisorId = teamId ? await getTeamSupervisorId(teamId) : null;

// Fetch team members names — needed in email HTML AND in notification body
const [teamMembersRows] = await db.execute(
  `SELECT CONCAT(u.first_name, ' ', u.last_name) AS full_name
   FROM team_member tm
   JOIN users u ON u.id = tm.student_id
   WHERE tm.team_id = ? AND tm.status = 'ACCEPTED'`,
  [teamId]
);
const teamMembersStr = teamMembersRows.map(m => m.full_name).join(", ") || "—";

// Fetch supervisor name
const [supRows] = await db.execute(
  `SELECT CONCAT(u.first_name, ' ', u.last_name) AS full_name
   FROM users u WHERE u.id = ?`,
  [supervisorId]
);
const supervisorName = supRows[0]?.full_name || "—";

// Build jury list string (juryRows is fetched at line 344, already available)
const juryStr = juryRows.map(j => {
  const r = j.role === "PRESIDENT" ? "President"
          : j.role === "RAPPORTEUR" ? "Rapporteur" : "Examiner";
  return `${j.full_name} (${r})`;
}).join(", ");

// ── END OF ADD ─────────────────────────────────────────────────────────

// Send HTML email to each jury member  ← line 355 (email loop starts here)
    let emailsSent = 0;
    let emailError = null;
    for (const member of juryRows) {
      const roleLabel =
        member.role === "PRESIDENT"
          ? "President"
          : member.role === "RAPPORTEUR"
          ? "Rapporteur"
          : "Examiner";
          try {
        await transporter.sendMail({
          from: `"ESI-SBA PFE Platform" <${process.env.SMTP_USER}>`,
          to: member.email,
          subject: `Defense Jury Assignment – ${s.project_title} | ESI-SBA PFE`,
          html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f0f4f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- ═══ HEADER ═══ -->
          <tr>
            <td style="background:linear-gradient(135deg,#193962 0%,#1e5799 60%,#2D8FBF 100%);padding:36px 40px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;color:#a8cfe8;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">École Supérieure en Informatique – Sidi Bel Abbès</p>
                    <h1 style="margin:0 0 4px;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Defense Jury Assignment</h1>
                    <p style="margin:0;color:#c8dff0;font-size:13px;">Final-Year Project (PFE) — Academic Notification</p>
                  </td>
                  <td align="right" valign="middle" style="padding-left:20px;">
                    <div style="background:rgba(255,255,255,0.15);border-radius:50%;width:52px;height:52px;text-align:center;line-height:52px;font-size:24px;">🎓</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ ROLE BADGE ═══ -->
          <tr>
            <td style="background:#eaf2fb;padding:14px 40px;border-bottom:1px solid #dce8f3;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="margin:0;font-size:13px;color:#555555;">
                      You have been officially assigned as jury member for a PFE defense session.
                    </p>
                  </td>
                  <td align="right" style="white-space:nowrap;padding-left:16px;">
                    <span style="display:inline-block;background:#193962;color:#ffffff;font-size:12px;font-weight:700;padding:5px 14px;border-radius:20px;letter-spacing:0.5px;text-transform:uppercase;">${roleLabel}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ BODY ═══ -->
          <tr>
            <td style="padding:36px 40px;">

              <!-- Salutation -->
              <p style="margin:0 0 20px;font-size:15px;color:#333333;line-height:1.6;">
                Dear <strong style="color:#193962;">${member.full_name}</strong>,
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#555555;line-height:1.7;">
                We are pleased to inform you that you have been assigned as
                <strong style="color:#193962;">${roleLabel}</strong> for the final-year project
                defense detailed below. Kindly take note of the scheduled session information
                and review all attached deliverables prior to the defense.
              </p>

              <!-- ── Project Info Card ── -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                     style="background:#f4f7fb;border:1px solid #dce8f3;border-left:4px solid #193962;border-radius:6px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#2D8FBF;text-transform:uppercase;letter-spacing:1.5px;">Project</p>
                    <h2 style="margin:0 0 18px;font-size:17px;color:#193962;font-weight:700;line-height:1.4;">${s.project_title}</h2>
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:13.5px;color:#444444;">
                      <tr>
                        <td style="padding:7px 0;font-weight:700;color:#333333;width:110px;vertical-align:top;">📅&nbsp; Date</td>
                        <td style="padding:7px 0;color:#555555;">${formattedDate}</td>
                      </tr>
                      <tr style="border-top:1px solid #e4ecf4;">
                        <td style="padding:7px 0;font-weight:700;color:#333333;vertical-align:top;">🕐&nbsp; Time</td>
                        <td style="padding:7px 0;color:#555555;">${s.time}</td>
                      </tr>
                      <tr style="border-top:1px solid #e4ecf4;">
                        <td style="padding:7px 0;font-weight:700;color:#333333;vertical-align:top;">📍&nbsp; Room</td>
                        <td style="padding:7px 0;color:#555555;">${s.room_name}</td>
                      </tr>
                      <tr style="border-top:1px solid #e4ecf4;">
                        <td style="padding:7px 0;font-weight:700;color:#333333;vertical-align:top;">🎖️&nbsp; Your Role</td>
                        <td style="padding:7px 0;font-weight:700;color:#193962;">${roleLabel}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ── Jury Composition ── -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                     style="background:#fafafa;border:1px solid #e8e8e8;border-radius:6px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#2D8FBF;text-transform:uppercase;letter-spacing:1.5px;">Jury Composition</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      ${juryRows.map((j, i) => {
                        const r = j.role === "PRESIDENT" ? "President"
                                : j.role === "RAPPORTEUR" ? "Rapporteur" : "Examiner";
                        const isRecipient = j.email === member.email;
                        const roleColor = j.role === "PRESIDENT" ? "#7c3aed"
                                        : j.role === "RAPPORTEUR" ? "#0369a1" : "#15803d";
                        const roleBg   = j.role === "PRESIDENT" ? "#f3f0ff"
                                        : j.role === "RAPPORTEUR" ? "#e0f2fe" : "#dcfce7";
                        return `<tr${i > 0 ? ' style="border-top:1px solid #eeeeee;"' : ''}>
                          <td style="padding:9px 0;vertical-align:middle;">
                            <span style="font-size:13.5px;color:${isRecipient ? "#193962" : "#444444"};font-weight:${isRecipient ? "700" : "400"};">
                              ${j.full_name}${isRecipient ? " <em style='font-size:11px;color:#888;font-style:italic;'>(you)</em>" : ""}
                            </span>
                          </td>
                          <td align="right" style="padding:9px 0;vertical-align:middle;">
                            <span style="display:inline-block;background:${roleBg};color:${roleColor};font-size:11px;font-weight:700;padding:3px 10px;border-radius:12px;letter-spacing:0.4px;">${r}</span>
                          </td>
                        </tr>`;
                      }).join("")}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ── Team Members ── -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                     style="background:#fafafa;border:1px solid #e8e8e8;border-radius:6px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#2D8FBF;text-transform:uppercase;letter-spacing:1.5px;">Project Team</p>
                    <p style="margin:0;font-size:13.5px;color:#555555;line-height:1.7;">👥&nbsp; ${teamMembersStr}</p>
                  </td>
                </tr>
              </table>

              <!-- ── Deliverables ── -->
              ${deliverables.length ? `
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                     style="background:#fafafa;border:1px solid #e8e8e8;border-radius:6px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#2D8FBF;text-transform:uppercase;letter-spacing:1.5px;">Submitted Deliverables</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      ${deliverables.map((d, i) => {
                        const isGithub = d.file_path?.includes("github.com");
                        const isPdf    = d.title?.toLowerCase().includes("report") || d.file_path?.toLowerCase().endsWith(".pdf");
                        const isPpt    = d.title?.toLowerCase().includes("presentation") || d.file_path?.toLowerCase().match(/\.(ppt|pptx)$/);
                        const icon     = isGithub ? "🔗" : isPdf ? "📄" : isPpt ? "📊" : "📁";
                        const typeLabel= isGithub ? "Repository" : isPdf ? "PDF" : isPpt ? "Presentation" : "File";
                        return `<tr${i > 0 ? ' style="border-top:1px solid #eeeeee;"' : ''}>
                          <td style="padding:10px 0;vertical-align:middle;">
                            <span style="font-size:16px;margin-right:10px;">${icon}</span>
                            <a href="${d.file_path}" target="_blank"
                               style="font-size:13.5px;color:#2D8FBF;text-decoration:none;font-weight:600;">${d.title}</a>
                            <span style="font-size:11px;color:#999999;margin-left:6px;">(${typeLabel})</span>
                          </td>
                          <td align="right" style="padding:10px 0;vertical-align:middle;white-space:nowrap;">
                            <a href="${d.file_path}" target="_blank"
                               style="font-size:12px;color:#ffffff;background:#2D8FBF;padding:4px 12px;border-radius:4px;text-decoration:none;font-weight:600;">
                              ${isGithub ? "Open Repo" : "View File"}
                            </a>
                          </td>
                        </tr>`;
                      }).join("")}
                    </table>
                  </td>
                </tr>
              </table>
              ` : `<p style="font-size:13px;color:#999999;margin-bottom:28px;">No deliverables have been submitted yet.</p>`}

              <!-- Closing note -->
              <p style="font-size:13.5px;color:#555555;line-height:1.7;margin:0 0 8px;padding:16px 20px;background:#fffbeb;border-left:3px solid #f59e0b;border-radius:4px;">
                ⚠️ Please review all submitted deliverables carefully <strong>before</strong> the defense session.
              </p>

            </td>
          </tr>

          <!-- ═══ FOOTER ═══ -->
          <tr>
            <td style="background:#f4f7fb;border-top:1px solid #dce8f3;padding:20px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;color:#999999;line-height:1.6;">
                      This is an automated notification from the <strong style="color:#193962;">ESI-SBA PFE Platform</strong>.<br>
                      Please do not reply to this email. For any queries, contact the academic office.
                    </p>
                  </td>
                  <td align="right" valign="middle" style="padding-left:20px;white-space:nowrap;">
                    <p style="margin:0;font-size:10px;color:#bbbbbb;">ESI-SBA · ${new Date().getFullYear()}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
          `,
        });
        emailsSent++;
      } catch (mailErr) {
        console.error(`Failed to send email to ${member.email}:`, mailErr.message);
        emailError = mailErr.message;
      }


}


await db.execute(
  "UPDATE soutenance SET jury_notified = 1 WHERE id = ?",
  [soutenanceId]
);
   res.json({
  message: emailError
    ? `In-app notifications sent. Email delivery failed: ${emailError}`
    : `Jury notified by email. In-app notifications sent to team.`,
  emailsSent,
  emailError: emailError || null,
});

  } catch (err) {
    console.error("notifyJury error:", err);
    res.status(500).json({ message: "Server error" });
  }
};