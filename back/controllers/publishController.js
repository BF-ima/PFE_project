// controllers/publishController.js
const db  = require("../config/db");
const jwt = require("jsonwebtoken");

const getUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [users] = await db.execute("SELECT id, role FROM users WHERE id = ?", [decoded.id]);
  if (users.length === 0) throw new Error("Utilisateur non trouvé");
  return users[0];
};

// POST /api/distribution/publish
exports.publishResults = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    if (!["admin", "super_admin"].includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Get all assignments with project info
    const [assignments] = await db.execute(`
      SELECT 
        a.team_id,
        a.project_id,
        p.title AS project_title,
        (SELECT w.priority FROM wish w 
         WHERE w.team_id = a.team_id 
           AND w.project_id = a.project_id 
           AND w.status = 'SUBMITTED' 
         LIMIT 1) AS priority
      FROM assignment a
      JOIN project p ON p.id = a.project_id
    `);

    if (assignments.length === 0) {
      return res.status(400).json({ message: "Aucune attribution à publier" });
    }

    // Get unassigned teams (submitted wishes but no assignment)
    const [unassignedTeams] = await db.execute(`
      SELECT DISTINCT team_id
      FROM wish
      WHERE status = 'SUBMITTED'
        AND team_id NOT IN (SELECT team_id FROM assignment)
    `);

    let notificationCount = 0;

    // Helper: get user_ids for all members of a team
  const getTeamUserIds = async (teamId) => {
  const [members] = await db.execute(`
    SELECT u.id AS user_id
    FROM team_member tm
    JOIN student s ON s.id = tm.student_id
    JOIN users u ON u.id = s.id
    WHERE tm.team_id = ?
  `, [teamId]);
  return members.map(m => m.user_id);
};

    // Helper: insert notification
    const insertNotification = async (userId, type, title, message) => {
      await db.execute(`
        INSERT INTO notification (user_id, type, title, message, is_read, created_at)
        VALUES (?, ?, ?, ?, 0, NOW())
      `, [userId, type, title, message]);
      notificationCount++;
    };

    // Notify assigned teams
    for (const assignment of assignments) {
      const priorityText = assignment.priority ? ` (Choice #${assignment.priority})` : "";
      const title   = "🎉 Project Assignment Result";
      const message = `Your team has been assigned to the project: "${assignment.project_title}"${priorityText}.`;

      const userIds = await getTeamUserIds(assignment.team_id);
      for (const userId of userIds) {
        await insertNotification(userId, "INFO", title, message);
      }
    }

    // Notify unassigned teams
    for (const team of unassignedTeams) {
      const title   = "⚠️ Project Assignment — No Project Assigned";
      const message = "Your team could not be automatically assigned to a project. Please contact the administration.";

      const userIds = await getTeamUserIds(team.team_id);
      for (const userId of userIds) {
        await insertNotification(userId, "ALERT", title, message);
      }
    }

    res.json({
      message:           "Results published successfully",
      notified_students: notificationCount,
      assigned_teams:    assignments.length,
      unassigned_teams:  unassignedTeams.length,
    });

  } catch (err) {
    console.error("publishResults error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};