const db  = require("../config/db");
const jwt = require("jsonwebtoken");

const getUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [users] = await db.execute(
    "SELECT id, role FROM users WHERE id = ?",
    [decoded.id]
  );
  if (users.length === 0) throw new Error("Utilisateur non trouvé");
  return users[0];
};

// Helper — get student's team_id
const getStudentTeam = async (userId) => {
  const [rows] = await db.execute(
    `SELECT tm.team_id FROM team_member tm
     WHERE tm.student_id = ? AND tm.status = 'ACCEPTED'
     LIMIT 1`,
    [userId]
  );
  return rows[0]?.team_id || null;
};

// Helper — get project_id for a team via assignment table
const getTeamProject = async (teamId) => {
  const [rows] = await db.execute(
    `SELECT project_id FROM assignment WHERE team_id = ? LIMIT 1`,
    [teamId]
  );
  return rows[0]?.project_id || null;
};

// Helper — verify supervisor owns the project linked to this team
const supervisorOwnsTeam = async (supervisorId, teamId) => {
  const [rows] = await db.execute(
    `SELECT a.id FROM assignment a
     JOIN project p ON p.id = a.project_id
     WHERE a.team_id = ?
       AND (p.teacher_id = ? OR p.external_supervisor_id = ?)
     LIMIT 1`,
    [teamId, supervisorId, supervisorId]
  );
  return rows.length > 0;
};

// ── GET /api/meetings/team/:teamId ─────────────────────────────────────────
// Used by supervisor to get all meetings for a specific team
exports.getMeetingsByTeam = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user   = await getUserFromToken(token);
    const teamId = parseInt(req.params.teamId);

    // Supervisor must own this team's project
    if (!["admin", "super_admin"].includes(user.role)) {
      const owns = await supervisorOwnsTeam(user.id, teamId);
      if (!owns) return res.status(403).json({ message: "Accès refusé" });
    }

    const [rows] = await db.execute(
      `SELECT m.*,
              CONCAT(u.first_name, ' ', u.last_name) AS created_by_name
       FROM meeting m
       LEFT JOIN users u ON u.id = m.created_by
       WHERE m.team_id = ?
       ORDER BY m.date ASC`,
      [teamId]
    );

    res.json({ meetings: rows });
  } catch (err) {
    console.error("getMeetingsByTeam error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── GET /api/meetings/my ───────────────────────────────────────────────────
// Used by student to get all meetings for their own team
exports.getMyMeetings = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user   = await getUserFromToken(token);
    const teamId = await getStudentTeam(user.id);

    if (!teamId) return res.json({ meetings: [], team: null });

    const projectId = await getTeamProject(teamId);

    // Fetch team info for display
    const [teamRows] = await db.execute(
      `SELECT t.id, p.title AS project_title,
              CONCAT(u.first_name, ' ', u.last_name) AS leader_name,
              GROUP_CONCAT(
                CASE WHEN tm.status = 'ACCEPTED'
                  THEN CONCAT(mu.first_name, ' ', mu.last_name)
                END
                ORDER BY tm.joined_at ASC
                SEPARATOR '|||'
              ) AS member_names
       FROM team t
       LEFT JOIN project p     ON p.id       = t.project_id OR p.id IN (SELECT project_id FROM assignment WHERE team_id = t.id)
       LEFT JOIN users u       ON u.id        = t.leader_id
       LEFT JOIN team_member tm ON tm.team_id = t.id
       LEFT JOIN users mu      ON mu.id       = tm.student_id
       WHERE t.id = ?
       GROUP BY t.id, p.title, u.first_name, u.last_name`,
      [teamId]
    );

    // Fetch meetings for this team
    const [meetings] = await db.execute(
      `SELECT m.*,
              CONCAT(u.first_name, ' ', u.last_name) AS created_by_name
       FROM meeting m
       LEFT JOIN users u ON u.id = m.created_by
       WHERE m.team_id = ?
       ORDER BY m.date ASC`,
      [teamId]
    );

    const teamInfo = teamRows[0] || null;
    if (teamInfo?.member_names) {
      teamInfo.member_names = teamInfo.member_names.split("|||");
    }

    res.json({ meetings, team: teamInfo });
  } catch (err) {
    console.error("getMyMeetings error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── POST /api/meetings ─────────────────────────────────────────────────────
// Supervisor creates a meeting for a team
exports.createMeeting = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);

    if (!["enseignant", "entreprise", "admin", "super_admin"].includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { team_id, date, time, location, link, topic } = req.body;

    if (!team_id) return res.status(400).json({ message: "team_id est requis" });
    if (!date)    return res.status(400).json({ message: "date est requise" });

    // Verify supervisor owns this team
    if (!["admin", "super_admin"].includes(user.role)) {
      const owns = await supervisorOwnsTeam(user.id, team_id);
      if (!owns) return res.status(403).json({ message: "Accès refusé" });
    }

    const projectId = await getTeamProject(team_id);
    if (!projectId) return res.status(400).json({ message: "Aucun projet assigné à cette équipe" });

    // Combine date + time into datetime
    const datetime = time ? `${date} ${time}:00` : `${date} 00:00:00`;

    const [result] = await db.execute(
      `INSERT INTO meeting (project_id, team_id, date, location, link, topic, feedback, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, NULL, 'SCHEDULED', ?)`,
      [projectId, team_id, datetime, location || null, link || null, topic || null, user.id]
    );

    res.status(201).json({ message: "Réunion créée avec succès", id: result.insertId });
  } catch (err) {
    console.error("createMeeting error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── PUT /api/meetings/:id ──────────────────────────────────────────────────
// Supervisor edits a meeting → status becomes RESCHEDULED automatically
exports.updateMeeting = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    const { id } = req.params;

    const [meetings] = await db.execute("SELECT * FROM meeting WHERE id = ?", [id]);
    if (meetings.length === 0) return res.status(404).json({ message: "Réunion non trouvée" });

    const meeting = meetings[0];

    // Verify supervisor owns this team
    if (!["admin", "super_admin"].includes(user.role)) {
      const owns = await supervisorOwnsTeam(user.id, meeting.team_id);
      if (!owns) return res.status(403).json({ message: "Accès refusé" });
    }

    const { date, time, location, link, topic } = req.body;
    const datetime = (date && time) ? `${date} ${time}:00`
                   : date            ? `${date} 00:00:00`
                   : meeting.date;

    await db.execute(
      `UPDATE meeting
       SET date = ?, location = ?, link = ?, topic = ?, status = 'RESCHEDULED'
       WHERE id = ?`,
      [datetime, location || null, link || null, topic || meeting.topic, id]
    );

    res.json({ message: "Réunion modifiée avec succès" });
  } catch (err) {
    console.error("updateMeeting error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── PATCH /api/meetings/:id/status ────────────────────────────────────────
// Supervisor marks meeting as COMPLETED or CANCELED
exports.updateMeetingStatus = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    const { id } = req.params;
    const { status, feedback } = req.body;

    const validStatuses = ["SCHEDULED", "COMPLETED", "CANCELED", "RESCHEDULED"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const [meetings] = await db.execute("SELECT * FROM meeting WHERE id = ?", [id]);
    if (meetings.length === 0) return res.status(404).json({ message: "Réunion non trouvée" });

    const meeting = meetings[0];

    if (!["admin", "super_admin"].includes(user.role)) {
      const owns = await supervisorOwnsTeam(user.id, meeting.team_id);
      if (!owns) return res.status(403).json({ message: "Accès refusé" });
    }

    await db.execute(
      `UPDATE meeting SET status = ?, feedback = COALESCE(?, feedback) WHERE id = ?`,
      [status, feedback || null, id]
    );

    res.json({ message: "Statut mis à jour avec succès" });
  } catch (err) {
    console.error("updateMeetingStatus error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── DELETE /api/meetings/:id ───────────────────────────────────────────────
exports.deleteMeeting = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    const { id } = req.params;

    const [meetings] = await db.execute("SELECT * FROM meeting WHERE id = ?", [id]);
    if (meetings.length === 0) return res.status(404).json({ message: "Réunion non trouvée" });

    const meeting = meetings[0];

    if (!["admin", "super_admin"].includes(user.role)) {
      const owns = await supervisorOwnsTeam(user.id, meeting.team_id);
      if (!owns) return res.status(403).json({ message: "Accès refusé" });
    }

    await db.execute("DELETE FROM meeting WHERE id = ?", [id]);
    res.json({ message: "Réunion supprimée avec succès" });
  } catch (err) {
    console.error("deleteMeeting error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};