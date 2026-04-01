/**
 * ==============================================================================
 * TEAM CONTROLLER
 * ==============================================================================
 * Handles all team-related operations for the Student role:
 *   - Create a team (leader only)
 *   - Invite members (max 6 total including leader)
 *   - Remove a member
 *   - Delete the entire team
 *   - Accept / refuse an invitation (invited student)
 *   - View my team
 * ==============================================================================
 */

const db  = require("../config/db");
const jwt = require("jsonwebtoken");

// ---------------------------------------------------------------------------
// HELPER — extract & verify student from token
// Returns { id, role } or throws
// ---------------------------------------------------------------------------
const getStudentFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [rows]  = await db.execute(
    "SELECT id, role FROM users WHERE id = ? AND is_active = 1",
    [decoded.id]
  );
  if (rows.length === 0) throw new Error("Utilisateur non trouvé");
  if (rows[0].role !== "etudiant") throw new Error("Accès réservé aux étudiants");
  return rows[0];
};

// ---------------------------------------------------------------------------
// HELPER — ensure the student exists in the `student` table
// ---------------------------------------------------------------------------
const ensureStudentRecord = async (userId) => {
  const [rows] = await db.execute("SELECT id FROM student WHERE id = ?", [userId]);
  if (rows.length === 0) throw new Error("Profil étudiant introuvable");
};

// ---------------------------------------------------------------------------
// POST /api/teams
// Create a team — the authenticated student becomes the leader
// Body: { project_id? }
// ---------------------------------------------------------------------------
exports.createTeam = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const student = await getStudentFromToken(token);
    await ensureStudentRecord(student.id);

    // A student can only lead one team at a time
    const [existing] = await db.execute(
      "SELECT id FROM team WHERE leader_id = ?",
      [student.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Vous êtes déjà chef d'une équipe" });
    }

    // A student cannot be an accepted member of another team while creating one
    const [memberOf] = await db.execute(
      "SELECT id FROM team_member WHERE student_id = ? AND status = 'ACCEPTED'",
      [student.id]
    );
    if (memberOf.length > 0) {
      return res.status(400).json({
        message: "Vous êtes déjà membre d'une équipe. Quittez-la avant d'en créer une",
      });
    }

    const { project_id } = req.body;

    // If a project is supplied, verify it exists and is VALIDATED
    if (project_id) {
      const [projects] = await db.execute(
        "SELECT id FROM project WHERE id = ? AND status = 'VALIDATED'",
        [project_id]
      );
      if (projects.length === 0) {
        return res.status(400).json({
          message: "Projet invalide ou non validé",
        });
      }

      // A project can only be claimed by one team
      const [takenProject] = await db.execute(
        "SELECT id FROM team WHERE project_id = ?",
        [project_id]
      );
      if (takenProject.length > 0) {
        return res.status(400).json({ message: "Ce projet est déjà pris par une autre équipe" });
      }
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Insert the team
      const [teamResult] = await connection.execute(
        `INSERT INTO team (project_id, leader_id, status, max_students, created_at)
         VALUES (?, ?, 'FORMING', 6, NOW())`,
        [project_id || null, student.id]
      );

      const teamId = teamResult.insertId;

      // Add the leader as an ACCEPTED member automatically
      await connection.execute(
        `INSERT INTO team_member (team_id, student_id, joined_at, status)
         VALUES (?, ?, NOW(), 'ACCEPTED')`,
        [teamId, student.id]
      );

      await connection.commit();
      res.status(201).json({
        message: "Équipe créée avec succès",
        teamId,
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("createTeam error:", err);
    if (err.message.includes("Accès réservé") || err.message.includes("non trouvé")) {
      return res.status(403).json({ message: err.message });
    }
    res.status(500).json({ message: "Erreur serveur lors de la création de l'équipe" });
  }
};

// ---------------------------------------------------------------------------
// POST /api/teams/:id/invite
// Send an invitation to a student — only the team leader can do this
// Body: { student_id }
// ---------------------------------------------------------------------------
exports.inviteMember = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const leader = await getStudentFromToken(token);
    const teamId = req.params.id;

    // Verify caller is the leader of this team
    const [teams] = await db.execute(
      "SELECT id, max_students FROM team WHERE id = ? AND leader_id = ?",
      [teamId, leader.id]
    );
    if (teams.length === 0) {
      return res.status(403).json({ message: "Accès refusé. Vous n'êtes pas le chef de cette équipe" });
    }

    const { student_id } = req.body;
    if (!student_id) {
      return res.status(400).json({ message: "student_id est requis" });
    }

    // Cannot invite yourself
    if (parseInt(student_id) === leader.id) {
      return res.status(400).json({ message: "Vous ne pouvez pas vous inviter vous-même" });
    }

    // Verify the target is a valid active student
    const [targetUser] = await db.execute(
      "SELECT u.id FROM users u INNER JOIN student s ON u.id = s.id WHERE u.id = ? AND u.role = 'etudiant' AND u.is_active = 1",
      [student_id]
    );
    if (targetUser.length === 0) {
      return res.status(404).json({ message: "Étudiant cible introuvable" });
    }

    // Check current accepted member count (max 6 including leader)
    const [memberCount] = await db.execute(
      "SELECT COUNT(*) AS cnt FROM team_member WHERE team_id = ? AND status = 'ACCEPTED'",
      [teamId]
    );
    if (memberCount[0].cnt >= teams[0].max_students) {
      return res.status(400).json({
        message: `L'équipe a atteint le nombre maximum de membres (${teams[0].max_students})`,
      });
    }

    // Check the student is not already in this team (any status)
    const [alreadyInTeam] = await db.execute(
      "SELECT id FROM team_member WHERE team_id = ? AND student_id = ?",
      [teamId, student_id]
    );
    if (alreadyInTeam.length > 0) {
      return res.status(400).json({ message: "Cet étudiant est déjà dans / invité dans cette équipe" });
    }

    // Check the student is not already an accepted member of another team
    const [otherTeam] = await db.execute(
      "SELECT id FROM team_member WHERE student_id = ? AND status = 'ACCEPTED'",
      [student_id]
    );
    if (otherTeam.length > 0) {
      return res.status(400).json({ message: "Cet étudiant est déjà membre d'une autre équipe" });
    }

    // Insert the invitation as PENDING
    await db.execute(
      `INSERT INTO team_member (team_id, student_id, joined_at, status)
       VALUES (?, ?, NOW(), 'PENDING')`,
      [teamId, student_id]
    );

    res.status(201).json({ message: "Invitation envoyée avec succès" });
  } catch (err) {
    console.error("inviteMember error:", err);
    res.status(500).json({ message: "Erreur serveur lors de l'invitation" });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/teams/:id/members/:studentId
// Remove a member from the team — only the leader can do this
// The leader cannot remove themselves
// ---------------------------------------------------------------------------
exports.removeMember = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const leader    = await getStudentFromToken(token);
    const teamId    = req.params.id;
    const studentId = req.params.studentId;

    // Verify caller is the leader
    const [teams] = await db.execute(
      "SELECT id FROM team WHERE id = ? AND leader_id = ?",
      [teamId, leader.id]
    );
    if (teams.length === 0) {
      return res.status(403).json({ message: "Accès refusé. Vous n'êtes pas le chef de cette équipe" });
    }

    // Leader cannot remove themselves
    if (parseInt(studentId) === leader.id) {
      return res.status(400).json({
        message: "Le chef d'équipe ne peut pas se retirer. Supprimez l'équipe si nécessaire",
      });
    }

    // Check the member exists in the team
    const [member] = await db.execute(
      "SELECT id FROM team_member WHERE team_id = ? AND student_id = ?",
      [teamId, studentId]
    );
    if (member.length === 0) {
      return res.status(404).json({ message: "Membre introuvable dans cette équipe" });
    }

    await db.execute(
      "DELETE FROM team_member WHERE team_id = ? AND student_id = ?",
      [teamId, studentId]
    );

    res.json({ message: "Membre retiré avec succès" });
  } catch (err) {
    console.error("removeMember error:", err);
    res.status(500).json({ message: "Erreur serveur lors du retrait du membre" });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/teams/:id
// Delete the entire team — only the leader can do this
// ---------------------------------------------------------------------------
exports.deleteTeam = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const leader = await getStudentFromToken(token);
    const teamId = req.params.id;

    // Verify caller is the leader
    const [teams] = await db.execute(
      "SELECT id FROM team WHERE id = ? AND leader_id = ?",
      [teamId, leader.id]
    );
    if (teams.length === 0) {
      return res.status(403).json({ message: "Accès refusé. Vous n'êtes pas le chef de cette équipe" });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Delete all members first (FK)
      await connection.execute("DELETE FROM team_member WHERE team_id = ?", [teamId]);
      // Delete the team
      await connection.execute("DELETE FROM team WHERE id = ?", [teamId]);

      await connection.commit();
      res.json({ message: "Équipe supprimée avec succès" });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("deleteTeam error:", err);
    res.status(500).json({ message: "Erreur serveur lors de la suppression de l'équipe" });
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/teams/invitations/:invitationId
// Accept or refuse an invitation — only the invited student can do this
// Body: { action: "accept" | "refuse" }
// ---------------------------------------------------------------------------
exports.respondToInvitation = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const student      = await getStudentFromToken(token);
    const invitationId = req.params.invitationId;
    const { action }   = req.body;

    if (!["accept", "refuse"].includes(action)) {
      return res.status(400).json({ message: "Action invalide. Utilisez 'accept' ou 'refuse'" });
    }

    // Verify the invitation belongs to this student and is still PENDING
    const [invitations] = await db.execute(
      "SELECT tm.id, tm.team_id, t.max_students FROM team_member tm INNER JOIN team t ON tm.team_id = t.id WHERE tm.id = ? AND tm.student_id = ? AND tm.status = 'PENDING'",
      [invitationId, student.id]
    );
    if (invitations.length === 0) {
      return res.status(404).json({ message: "Invitation introuvable ou déjà traitée" });
    }

    const invitation = invitations[0];

    if (action === "refuse") {
      await db.execute("DELETE FROM team_member WHERE id = ?", [invitationId]);
      return res.json({ message: "Invitation refusée" });
    }

    // ACCEPT — verify team is not already full
    const [memberCount] = await db.execute(
      "SELECT COUNT(*) AS cnt FROM team_member WHERE team_id = ? AND status = 'ACCEPTED'",
      [invitation.team_id]
    );
    if (memberCount[0].cnt >= invitation.max_students) {
      // Delete the invitation since the team is full
      await db.execute("DELETE FROM team_member WHERE id = ?", [invitationId]);
      return res.status(400).json({ message: "L'équipe est déjà pleine. Invitation annulée" });
    }

    // Check student is not already accepted in another team
    const [otherTeam] = await db.execute(
      "SELECT id FROM team_member WHERE student_id = ? AND status = 'ACCEPTED'",
      [student.id]
    );
    if (otherTeam.length > 0) {
      return res.status(400).json({
        message: "Vous êtes déjà membre d'une autre équipe. Quittez-la avant d'accepter cette invitation",
      });
    }

    await db.execute(
      "UPDATE team_member SET status = 'ACCEPTED', joined_at = NOW() WHERE id = ?",
      [invitationId]
    );

    res.json({ message: "Invitation acceptée avec succès" });
  } catch (err) {
    console.error("respondToInvitation error:", err);
    res.status(500).json({ message: "Erreur serveur lors du traitement de l'invitation" });
  }
};

// ---------------------------------------------------------------------------
// GET /api/teams/my
// Get the team the authenticated student belongs to (as leader or member)
// ---------------------------------------------------------------------------
exports.getMyTeam = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const student = await getStudentFromToken(token);

    // Find the team where this student is leader OR accepted member
    const [teamRows] = await db.execute(
      `SELECT t.id, t.project_id, t.leader_id, t.status, t.max_students, t.created_at,
              p.title AS project_title, p.description AS project_description
       FROM team t
       LEFT JOIN project p ON t.project_id = p.id
       WHERE t.leader_id = ?
          OR t.id IN (
            SELECT team_id FROM team_member
            WHERE student_id = ? AND status = 'ACCEPTED'
          )
       LIMIT 1`,
      [student.id, student.id]
    );

    if (teamRows.length === 0) {
      return res.status(404).json({ message: "Vous n'appartenez à aucune équipe" });
    }

    const team = teamRows[0];

    // Fetch all members of this team
    const [members] = await db.execute(
      `SELECT tm.id AS membership_id, tm.student_id, tm.status AS membership_status, tm.joined_at,
              u.first_name, u.last_name, u.email,
              s.moyenne, sp.name AS speciality_name
       FROM team_member tm
       INNER JOIN users u    ON tm.student_id   = u.id
       INNER JOIN student s  ON tm.student_id   = s.id
       LEFT  JOIN speciality sp ON s.speciality_id = sp.id
       WHERE tm.team_id = ?
       ORDER BY tm.joined_at ASC`,
      [team.id]
    );

    res.json({ team: { ...team, members } });
  } catch (err) {
    console.error("getMyTeam error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ---------------------------------------------------------------------------
// GET /api/teams/invitations
// List all PENDING invitations for the authenticated student
// ---------------------------------------------------------------------------
exports.getMyInvitations = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const student = await getStudentFromToken(token);

    const [invitations] = await db.execute(
      `SELECT tm.id AS invitation_id, tm.team_id, tm.joined_at AS invited_at,
              t.status AS team_status, t.max_students,
              u.first_name AS leader_first_name, u.last_name AS leader_last_name,
              p.title AS project_title
       FROM team_member tm
       INNER JOIN team     t  ON tm.team_id  = t.id
       INNER JOIN users    u  ON t.leader_id = u.id
       LEFT  JOIN project  p  ON t.project_id = p.id
       WHERE tm.student_id = ? AND tm.status = 'PENDING'
       ORDER BY tm.joined_at DESC`,
      [student.id]
    );

    res.json({ invitations });
  } catch (err) {
    console.error("getMyInvitations error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
