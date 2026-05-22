const db  = require("../config/db");
const jwt = require("jsonwebtoken");
const { createGroupConversations } = require("../services/groupService");


// Helper — get user info from token
const getUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [users] = await db.execute(
    "SELECT id, role FROM users WHERE id = ?",
    [decoded.id]
  );
  if (users.length === 0) throw new Error("Utilisateur non trouvé");
  return users[0];
};

// Helper — check if user is the team leader
const isTeamLeader = (team, userId) => team.leader_id === userId;

// -----------------------------------------------------------------------------
// CREATE TEAM  (student creates a team — leader_id = student who creates it)
// -----------------------------------------------------------------------------
exports.createTeam = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);

    if (user.role !== "etudiant") {
      return res.status(403).json({ message: "Accès refusé. Seuls les étudiants peuvent créer une équipe" });
    }

    // Verify the student exists in the student table
    const [students] = await db.execute(
      "SELECT id FROM student WHERE id = ?",
      [user.id]
    );
    if (students.length === 0) {
      return res.status(404).json({ message: "Profil étudiant non trouvé" });
    }

    // Prevent student from being in multiple teams
    const [alreadyMember] = await db.execute(
      `SELECT tm.id FROM team_member tm
       WHERE tm.student_id = ? AND tm.status = 'ACCEPTED'`,
      [user.id]
    );
    if (alreadyMember.length > 0) {
      return res.status(409).json({ message: "Vous appartenez déjà à une équipe" });
    }

    // Create the team — leader_id = the student who creates it
    const [result] = await db.execute(
      `INSERT INTO team (project_id, leader_id, status, created_at)
       VALUES (NULL, ?, 'FORMING', NOW())`,
      [user.id]
    );

    const teamId = result.insertId;

    // Auto-add the leader as the first ACCEPTED member
    await db.execute(
      `INSERT INTO team_member (team_id, student_id, joined_at, status)
       VALUES (?, ?, NOW(), 'ACCEPTED')`,
      [teamId, user.id]
    );

    await createGroupConversations(teamId, null);

    res.status(201).json({
      message: "Équipe créée avec succès",
      teamId,
    });

  } catch (err) {
    console.error("createTeam error:", err);
    res.status(500).json({ message: "Erreur serveur lors de la création de l'équipe" });
  }
};

// -----------------------------------------------------------------------------
// ASSIGN PROJECT TO TEAM  (leader only)
// -----------------------------------------------------------------------------
exports.assignProject = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user           = await getUserFromToken(token);
    const { id }         = req.params;
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({ message: "project_id est requis" });
    }

    const [teams] = await db.execute("SELECT * FROM team WHERE id = ?", [id]);
    if (teams.length === 0) {
      return res.status(404).json({ message: "Équipe non trouvée" });
    }

    // Only the leader can assign a project
    if (!isTeamLeader(teams[0], user.id)) {
      return res.status(403).json({ message: "Accès refusé. Seul le leader peut assigner un projet" });
    }

    if (teams[0].project_id !== null) {
      return res.status(409).json({ message: "L'équipe a déjà un projet assigné" });
    }

    // Verify project is VALIDATED
    const [projects] = await db.execute(
      "SELECT id, status, max_students FROM project WHERE id = ?",
      [project_id]
    );
    if (projects.length === 0) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }
    if (projects[0].status !== "VALIDATED") {
      return res.status(400).json({ message: "Le projet doit être validé pour être assigné" });
    }

    // Check team size vs project capacity
    const [[{ count }]] = await db.execute(
      "SELECT COUNT(*) AS count FROM team_member WHERE team_id = ? AND status = 'ACCEPTED'",
      [id]
    );
    if (count > projects[0].max_students) {
      return res.status(400).json({
        message: `L'équipe dépasse la capacité du projet (max: ${projects[0].max_students} étudiants)`,
      });
    }

    // Check no other team already has this project
    const [otherTeam] = await db.execute(
      "SELECT id FROM team WHERE project_id = ?",
      [project_id]
    );
    if (otherTeam.length > 0) {
      return res.status(409).json({ message: "Ce projet est déjà pris par une autre équipe" });
    }

    await db.execute("UPDATE team SET project_id = ? WHERE id = ?", [project_id, id]);

    const supervisorId = projects[0].teacher_id ?? projects[0].external_supervisor_id ?? null;
    if (supervisorId) await createGroupConversations(parseInt(id), supervisorId);

    res.json({ message: "Projet assigné à l'équipe avec succès" });

  } catch (err) {
    console.error("assignProject error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// GET ALL TEAMS (optionally filtered by project_id or status)
// -----------------------------------------------------------------------------
exports.getAllTeams = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    await getUserFromToken(token);

    const { project_id, status } = req.query;

    let query = `
      SELECT t.*,
             CONCAT(u.first_name, ' ', u.last_name)              AS leader_name,
             u.email                                               AS leader_email,
             COALESCE(p_a.title, p_t.title)                       AS project_title,
             COALESCE(p_a.max_students, p_t.max_students)         AS project_max_students,
             a.mode                                                AS assignment_mode,
             a.assigned_at,
             COUNT(CASE WHEN tm.status = 'ACCEPTED' THEN 1 END)   AS member_count
      FROM team t
      LEFT JOIN users       u   ON t.leader_id   = u.id
      LEFT JOIN team_member tm  ON tm.team_id    = t.id
      LEFT JOIN assignment  a   ON a.team_id     = t.id
      LEFT JOIN project     p_a ON p_a.id        = a.project_id
      LEFT JOIN project     p_t ON p_t.id        = t.project_id
    `;

    const conditions = [];
    const params     = [];

    if (project_id) {
      conditions.push("(a.project_id = ? OR t.project_id = ?)");
      params.push(project_id, project_id);
    }
    if (status) {
      conditions.push("t.status = ?");
      params.push(status.toUpperCase());
    }

    if (conditions.length > 0) query += ` WHERE ${conditions.join(" AND ")}`;
    query += ` GROUP BY t.id, u.first_name, u.last_name, u.email,
                        p_a.title, p_a.max_students,
                        p_t.title, p_t.max_students,
                        a.mode, a.assigned_at
               ORDER BY t.created_at DESC`;

    const [teams] = await db.execute(query, params);
    res.json({ teams });

  } catch (err) {
    console.error("getAllTeams error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// -----------------------------------------------------------------------------
// GET SINGLE TEAM (with members)
// -----------------------------------------------------------------------------
exports.getTeamById = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    await getUserFromToken(token);

    const { id } = req.params;

    const [teams] = await db.execute(
      `SELECT t.*,
              CONCAT(u.first_name, ' ', u.last_name)       AS leader_name,
              u.email                                        AS leader_email,
              COALESCE(p_a.title,       p_t.title)          AS project_title,
              COALESCE(p_a.description, p_t.description)    AS project_description,
              COALESCE(p_a.max_students,p_t.max_students)   AS project_max_students,
              COALESCE(p_a.status,      p_t.status)         AS project_status,
              a.mode                                         AS assignment_mode,
              a.assigned_at
       FROM team t
       LEFT JOIN users      u   ON t.leader_id  = u.id
       LEFT JOIN assignment a   ON a.team_id    = t.id
       LEFT JOIN project    p_a ON p_a.id       = a.project_id
       LEFT JOIN project    p_t ON p_t.id       = t.project_id
       WHERE t.id = ?`,
      [id]
    );

    if (teams.length === 0) {
      return res.status(404).json({ message: "Équipe non trouvée" });
    }

    const [members] = await db.execute(
      `SELECT tm.id, tm.student_id, tm.joined_at, tm.status,
              CONCAT(u.first_name, ' ', u.last_name) AS student_name,
              u.email                                  AS student_email
       FROM team_member tm
       JOIN users u ON u.id = tm.student_id
       WHERE tm.team_id = ?
       ORDER BY tm.joined_at ASC`,
      [id]
    );

    res.json({ team: { ...teams[0], members } });

  } catch (err) {
    console.error("getTeamById error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// GET MY TEAM (team the logged-in student belongs to)
// -----------------------------------------------------------------------------
exports.getMyTeam = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);

    // Step 1: get the team
    const [rows] = await db.execute(
      `SELECT t.*,
              CONCAT(u.first_name, ' ', u.last_name) AS leader_name,
              u.email                                  AS leader_email,
              p.title                                  AS project_title,
              p.max_students                           AS project_max_students,
              tm.status                                AS my_status
       FROM team_member tm
       JOIN team    t  ON t.id  = tm.team_id
       LEFT JOIN users   u  ON u.id  = t.leader_id
       LEFT JOIN project p  ON p.id  = t.project_id
       WHERE tm.student_id = ? AND tm.status = 'ACCEPTED'
       ORDER BY tm.joined_at DESC
       LIMIT 1`,
      [user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Vous n'appartenez à aucune équipe" });
    }

    const team = rows[0];

    // Step 2: get members for that team
    const [members] = await db.execute(
      `SELECT tm.id, tm.student_id, tm.joined_at, tm.status,
              CONCAT(u.first_name, ' ', u.last_name) AS student_name,
              u.email                                  AS student_email
       FROM team_member tm
       JOIN users u ON u.id = tm.student_id
       WHERE tm.team_id = ? AND tm.status = 'ACCEPTED'
       ORDER BY tm.joined_at ASC`,
      [team.id]
    );

    res.json({ team: { ...team, members } });

  } catch (err) {
    console.error("getMyTeam error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// -----------------------------------------------------------------------------
// UPDATE TEAM STATUS (leader or admin)
// -----------------------------------------------------------------------------
exports.updateTeamStatus = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user   = await getUserFromToken(token);
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["FORMING", "VALIDATED", "COMPLETED"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const [teams] = await db.execute("SELECT * FROM team WHERE id = ?", [id]);
    if (teams.length === 0) {
      return res.status(404).json({ message: "Équipe non trouvée" });
    }

    const isAdmin = ["admin", "super_admin"].includes(user.role);
    if (!isAdmin && !isTeamLeader(teams[0], user.id)) {
      return res.status(403).json({ message: "Accès refusé. Seul le leader peut modifier le statut" });
    }

    await db.execute("UPDATE team SET status = ? WHERE id = ?", [status, id]);

    res.json({ message: "Statut de l'équipe mis à jour avec succès" });

  } catch (err) {
    console.error("updateTeamStatus error:", err);
    res.status(500).json({ message: "Erreur serveur lors de la modification" });
  }
};

// -----------------------------------------------------------------------------
// DELETE TEAM (leader or admin)
// -----------------------------------------------------------------------------
exports.deleteTeam = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user   = await getUserFromToken(token);
    const { id } = req.params;

    const [teams] = await db.execute("SELECT * FROM team WHERE id = ?", [id]);
    if (teams.length === 0) {
      return res.status(404).json({ message: "Équipe non trouvée" });
    }

    const isAdmin = ["admin", "super_admin"].includes(user.role);

    if (!isAdmin && !isTeamLeader(teams[0], user.id)) {
      return res.status(403).json({ message: "Accès refusé. Seul le leader peut supprimer l'équipe" });
    }

    // ── Check project via BOTH team.project_id AND assignment table ───────
    const hasDirectProject = teams[0].project_id !== null;
    const [assignmentRows] = await db.execute(
      "SELECT id FROM assignment WHERE team_id = ?", [id]
    );
    const hasAssignedProject = assignmentRows.length > 0;

    if (!isAdmin && (hasDirectProject || hasAssignedProject)) {
      return res.status(400).json({
        message: "Impossible de supprimer une équipe ayant un projet assigné",
      });
    }

    // ── Delete in correct FK order ─────────────────────────────────────────

    // 1. Get all conversation ids
    const [convRows] = await db.execute(
      "SELECT id FROM group_conversation WHERE team_id = ?", [id]
    );
    const convIds = convRows.map((r) => r.id);

    // 2. Delete messages inside conversations
    if (convIds.length > 0) {
      await db.execute(
        `DELETE FROM group_message WHERE group_conversation_id IN (${convIds.map(() => '?').join(',')})`,
        convIds
      );
    }

    // 3. Delete conversations
    await db.execute("DELETE FROM group_conversation WHERE team_id = ?", [id]);

    // 4. Delete wishes
    await db.execute("DELETE FROM wish WHERE team_id = ?", [id]);

    // 5. Delete meetings
    await db.execute("DELETE FROM meeting WHERE team_id = ?", [id]);

    // 6. Delete deliverables
    await db.execute("DELETE FROM deliverable WHERE team_id = ?", [id]);

    // 7. Delete assignments
    await db.execute("DELETE FROM assignment WHERE team_id = ?", [id]);

    // 8. Delete team members
    await db.execute("DELETE FROM team_member WHERE team_id = ?", [id]);

    // 9. Finally delete the team
    await db.execute("DELETE FROM team WHERE id = ?", [id]);

    res.json({ message: "Équipe supprimée avec succès" });

  } catch (err) {
    console.error("deleteTeam error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// REQUEST TO JOIN A TEAM (student)
// -----------------------------------------------------------------------------
exports.requestJoinTeam = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user   = await getUserFromToken(token);
    const { id } = req.params;

    if (user.role !== "etudiant") {
      return res.status(403).json({ message: "Accès refusé. Seuls les étudiants peuvent rejoindre une équipe" });
    }

    const [students] = await db.execute("SELECT id FROM student WHERE id = ?", [user.id]);
    if (students.length === 0) {
      return res.status(404).json({ message: "Profil étudiant non trouvé" });
    }

    const [teams] = await db.execute(
      `SELECT t.*, p.max_students AS project_max_students
       FROM team t
       LEFT JOIN project p ON p.id = t.project_id
       WHERE t.id = ?`,
      [id]
    );
    if (teams.length === 0) {
      return res.status(404).json({ message: "Équipe non trouvée" });
    }

    const team = teams[0];

    if (team.status !== "FORMING") {
      return res.status(400).json({ message: "L'équipe n'accepte plus de nouveaux membres" });
    }

    // Capacity check — only if a project is assigned
    if (team.project_id !== null) {
      const [[{ count }]] = await db.execute(
        "SELECT COUNT(*) AS count FROM team_member WHERE team_id = ? AND status = 'ACCEPTED'",
        [id]
      );
      if (count >= team.project_max_students) {
        return res.status(400).json({ message: "L'équipe a atteint la capacité maximale du projet" });
      }
    }

    // Prevent student from being in another team
    const [alreadyMember] = await db.execute(
      "SELECT id FROM team_member WHERE student_id = ? AND status = 'ACCEPTED'",
      [user.id]
    );
    if (alreadyMember.length > 0) {
      return res.status(409).json({ message: "Vous appartenez déjà à une équipe" });
    }

    // Check for duplicate request to this team
    const [existing] = await db.execute(
      "SELECT id, status FROM team_member WHERE team_id = ? AND student_id = ?",
      [id, user.id]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        message: `Vous avez déjà une demande ${existing[0].status} pour cette équipe`,
      });
    }

    await db.execute(
      `INSERT INTO team_member (team_id, student_id, joined_at, status)
       VALUES (?, ?, NOW(), 'PENDING')`,
      [id, user.id]
    );

    res.status(201).json({ message: "Demande d'adhésion envoyée avec succès" });

  } catch (err) {
    console.error("requestJoinTeam error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// ACCEPT A MEMBER (leader only)
// -----------------------------------------------------------------------------
exports.acceptMember = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user             = await getUserFromToken(token);
    const { id, memberId } = req.params;

    const [teams] = await db.execute(
      `SELECT t.*, p.max_students AS project_max_students
       FROM team t
       LEFT JOIN project p ON p.id = t.project_id
       WHERE t.id = ?`,
      [id]
    );
    if (teams.length === 0) {
      return res.status(404).json({ message: "Équipe non trouvée" });
    }

    // Only the leader can accept members
    if (!isTeamLeader(teams[0], user.id)) {
      return res.status(403).json({ message: "Accès refusé. Seul le leader peut accepter des membres" });
    }

    const [pendingMember] = await db.execute(
      "SELECT * FROM team_member WHERE id = ? AND team_id = ?",
      [memberId, id]
    );
    if (pendingMember.length === 0) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }
    if (pendingMember[0].status !== "PENDING") {
      return res.status(400).json({ message: "La demande n'est pas en attente" });
    }

    // Re-check capacity if project assigned
    if (teams[0].project_id !== null) {
      const [[{ count }]] = await db.execute(
        "SELECT COUNT(*) AS count FROM team_member WHERE team_id = ? AND status = 'ACCEPTED'",
        [id]
      );
      if (count >= teams[0].project_max_students) {
        return res.status(400).json({ message: "L'équipe a atteint la capacité maximale du projet" });
      }
    }

    await db.execute(
      "UPDATE team_member SET status = 'ACCEPTED', joined_at = NOW() WHERE id = ?",
      [memberId]
    );

    res.json({ message: "Membre accepté avec succès" });

  } catch (err) {
    console.error("acceptMember error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// REMOVE / REJECT A MEMBER (leader or admin)
// -----------------------------------------------------------------------------
exports.removeMember = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user             = await getUserFromToken(token);
    const { id, memberId } = req.params;

    const [teams] = await db.execute("SELECT * FROM team WHERE id = ?", [id]);
    if (teams.length === 0) {
      return res.status(404).json({ message: "Équipe non trouvée" });
    }

    const [targetMember] = await db.execute(
      "SELECT * FROM team_member WHERE id = ? AND team_id = ?",
      [memberId, id]
    );
    if (targetMember.length === 0) {
      return res.status(404).json({ message: "Membre non trouvé" });
    }

    const isAdmin = ["admin", "super_admin"].includes(user.role);

    if (!isAdmin && !isTeamLeader(teams[0], user.id)) {
      return res.status(403).json({ message: "Accès refusé. Seul le leader peut retirer des membres" });
    }

    // Cannot remove the leader
    if (targetMember[0].student_id === teams[0].leader_id) {
      return res.status(400).json({ message: "Impossible de retirer le leader de l'équipe" });
    }

    await db.execute("DELETE FROM team_member WHERE id = ?", [memberId]);

    res.json({ message: "Membre retiré avec succès" });

  } catch (err) {
    console.error("removeMember error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// GET TEAM MEMBERS
// -----------------------------------------------------------------------------
exports.getTeamMembers = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    await getUserFromToken(token);

    const { id }     = req.params;
    const { status } = req.query;

    let query = `
      SELECT tm.id, tm.team_id, tm.student_id, tm.joined_at, tm.status,
             CONCAT(u.first_name, ' ', u.last_name) AS student_name,
             u.email                                  AS student_email
      FROM team_member tm
      JOIN users u ON u.id = tm.student_id
      WHERE tm.team_id = ?
    `;
    const params = [id];

    if (status) {
      query += ` AND tm.status = ?`;
      params.push(status.toUpperCase());
    }

    query += ` ORDER BY tm.joined_at ASC`;

    const [members] = await db.execute(query, params);
    res.json({ members });

  } catch (err) {
    console.error("getTeamMembers error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

//----------------------------------------------------------------------
// INVITE A STUDENT (leader sends request on behalf of student)
//----------------------------------------------------------------------
exports.inviteMember = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    const { id } = req.params;
    const { student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ message: "student_id est requis" });
    }

    const [teams] = await db.execute(
      `SELECT t.*, p.max_students AS project_max_students
       FROM team t LEFT JOIN project p ON p.id = t.project_id
       WHERE t.id = ?`,
      [id]
    );
    if (teams.length === 0)
      return res.status(404).json({ message: "Équipe non trouvée" });

    if (!isTeamLeader(teams[0], user.id))
      return res.status(403).json({ message: "Seul le leader peut inviter des membres" });

    if (teams[0].status !== "FORMING")
      return res.status(400).json({ message: "L'équipe n'accepte plus de nouveaux membres" });

    // Capacity check
    if (teams[0].project_id !== null) {
      const [[{ count }]] = await db.execute(
        "SELECT COUNT(*) AS count FROM team_member WHERE team_id = ? AND status = 'ACCEPTED'",
        [id]
      );
      if (count >= teams[0].project_max_students)
        return res.status(400).json({ message: "Capacité maximale atteinte" });
    }

    // Student must not already be in a team
    const [alreadyMember] = await db.execute(
      "SELECT id FROM team_member WHERE student_id = ? AND status = 'ACCEPTED'",
      [student_id]
    );
    if (alreadyMember.length > 0)
      return res.status(409).json({ message: "Cet étudiant appartient déjà à une équipe" });

    // No duplicate invite
    const [existing] = await db.execute(
      "SELECT id FROM team_member WHERE team_id = ? AND student_id = ?",
      [id, student_id]
    );
    if (existing.length > 0)
      return res.status(409).json({ message: "Une demande existe déjà pour cet étudiant" });

    // ── SPECIALITY CHECK ──────────────────────────────────────────────────
    // Fetch leader's speciality
    const [leaderRows] = await db.execute(
      "SELECT speciality_id FROM student WHERE id = ?",
      [user.id]
    );
    if (leaderRows.length === 0)
      return res.status(404).json({ message: "Profil du leader non trouvé" });

    // Fetch invited student's speciality
    const [invitedRows] = await db.execute(
      "SELECT speciality_id FROM student WHERE id = ?",
      [student_id]
    );
    if (invitedRows.length === 0)
      return res.status(404).json({ message: "Profil de l'étudiant invité non trouvé" });

    if (leaderRows[0].speciality_id !== invitedRows[0].speciality_id) {
      return res.status(400).json({
        message: "L'étudiant invité doit appartenir à la même spécialité que le leader",
      });
    }
    // ─────────────────────────────────────────────────────────────────────

    await db.execute(
      `INSERT INTO team_member (team_id, student_id, joined_at, status) VALUES (?, ?, NOW(), 'PENDING')`,
      [id, student_id]
    );

    res.status(201).json({ message: "Invitation envoyée avec succès" });

  } catch (err) {
    console.error("inviteMember error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// -----------------------------------------------------------------------------
// GET TEAMS ASSIGNED TO SUPERVISOR  
// -----------------------------------------------------------------------------
exports.getSupervisorTeams = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);

    if (!["enseignant", "admin", "super_admin", "entreprise"].includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const [teams] = await db.execute(
      `SELECT
         t.id                                                AS team_id,
         t.status                                            AS team_status,
         t.created_at,
         p.title                                             AS project_title,
         p.max_students,
         p.status                                            AS project_status,
         sp.name                                             AS speciality_name,
         CONCAT(u.first_name, ' ', u.last_name)             AS leader_name,
         u.email                                             AS leader_email,
         a.assigned_at,
         a.mode,
         COUNT(CASE WHEN tm.status = 'ACCEPTED' THEN 1 END) AS member_count,
         GROUP_CONCAT(
           CASE WHEN tm.status = 'ACCEPTED'
             THEN CONCAT(mu.first_name, ' ', mu.last_name)
           END
           ORDER BY tm.joined_at ASC
           SEPARATOR ', '
         )                                                   AS members_names,

         -- FIX: count distinct deliverable titles submitted by this specific team
         (
           SELECT COUNT(DISTINCT d.title)
           FROM deliverable d
           WHERE d.team_id = t.id
             AND d.title IN (
               'Final Report',
               'Source Code Repository',
               'Defense Presentation'
             )
             -- only count the latest version of each title
             AND d.version = (
               SELECT MAX(d2.version)
               FROM deliverable d2
               WHERE d2.team_id = d.team_id
                 AND d2.title   = d.title
             )
         )                                                   AS submitted_count

       FROM assignment a
       JOIN project      p   ON p.id       = a.project_id
       JOIN team         t   ON t.id       = a.team_id
       JOIN users        u   ON u.id       = t.leader_id
       JOIN team_member  tm  ON tm.team_id = t.id
       JOIN users        mu  ON mu.id      = tm.student_id
       LEFT JOIN speciality sp ON sp.id    = p.speciality_id
       WHERE (p.teacher_id = ? OR p.external_supervisor_id = ?)
       GROUP BY
         t.id, t.status, t.created_at,
         p.title, p.max_students, p.status,
         sp.name, u.first_name, u.last_name, u.email,
         a.assigned_at, a.mode
       ORDER BY a.assigned_at DESC`,
      [user.id, user.id]
    );

    res.json({ teams });

  } catch (err) {
    console.error("getSupervisorTeams error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};