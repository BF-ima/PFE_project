const db  = require("../config/db");
const jwt = require("jsonwebtoken");

const getUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [users] = await db.execute("SELECT id, role FROM users WHERE id = ?", [decoded.id]);
  if (users.length === 0) throw new Error("Utilisateur non trouvé");
  return users[0];
};

// GET /api/deliverable-deadlines/my-teams
// Returns all teams supervised by this enseignant with their deadlines
exports.getMyTeamsDeadlines = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "enseignant") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Get all teams assigned to projects supervised by this teacher
    const [teams] = await db.execute(
  `SELECT t.id AS team_id,
          CONCAT(u.first_name, ' ', u.last_name) AS leader_name,
          p.title AS project_title,
          p.id    AS project_id
   FROM team t
   JOIN users u ON u.id = t.leader_id
   JOIN project p ON (
     p.id = t.project_id                          -- via team.project_id
     OR p.id = (
       SELECT a.project_id FROM assignment a
       WHERE a.team_id = t.id LIMIT 1
     )                                             -- via assignment table
   )
   WHERE p.teacher_id = ?
   ORDER BY p.title, t.id`,
  [user.id]
);

    // For each team, get its deadlines
    const teamsWithDeadlines = await Promise.all(
      teams.map(async (team) => {
        const [deadlines] = await db.execute(
          `SELECT id, deliverable_type, deadline_date, deadline_time
           FROM deliverable_deadline
           WHERE team_id = ?
           ORDER BY deadline_date ASC`,
          [team.team_id]
        );
        return { ...team, deadlines };
      })
    );

    res.json({ teams: teamsWithDeadlines });
  } catch (err) {
    console.error("getMyTeamsDeadlines error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// POST /api/deliverable-deadlines
// Set a deadline for a specific team + deliverable type
exports.setDeadline = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    console.log("DEBUG user from token:", user); // add this
    if (user.role !== "enseignant") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { team_id, deliverable_type, deadline_date, deadline_time } = req.body;

    if (!team_id || !deliverable_type || !deadline_date || !deadline_time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const validTypes  = ["Final Report", "Source Code Repository", "Defense Presentation"];
  

    if (!validTypes.includes(deliverable_type)) {
      return res.status(400).json({ message: "Invalid deliverable type" });
    }
  

    // Verify the supervisor owns this team's project
    const [check] = await db.execute(
      `SELECT t.id FROM team t
       JOIN assignment a ON a.team_id  = t.id
       JOIN project p    ON p.id       = a.project_id
       WHERE t.id = ? AND p.teacher_id = ?`,
      [team_id, user.id]
    );
    if (check.length === 0) {
      return res.status(403).json({ message: "You don't supervise this team" });
    }

    // Upsert — one deadline per team + type 
    await db.execute(
      `INSERT INTO deliverable_deadline
         (team_id, deliverable_type, deadline_date, deadline_time, created_by)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         deadline_date = VALUES(deadline_date),
         deadline_time = VALUES(deadline_time),
         updated_at    = NOW()`,
      [team_id, deliverable_type, deadline_date, deadline_time, user.id]
    );

    // Send notification to all students in the team
    const [members] = await db.execute(
      `SELECT tm.student_id
       FROM team_member tm
       WHERE tm.team_id = ? AND tm.status = 'ACCEPTED'`,
      [team_id]
    );

    const notifMessage = `New deadline set: ${deliverable_type}  due on ${deadline_date} at ${deadline_time.slice(0, 5)}`;

    await Promise.all(
      members.map(({ student_id }) =>
        db.execute(
          `INSERT INTO notification (user_id, message, type, is_read, created_at)
           VALUES (?, ?, 'INFO', 0, NOW())`,
          [student_id, notifMessage]
        )
      )
    );

    res.status(201).json({ message: "Deadline set and students notified" });
  } catch (err) {
    console.error("setDeadline error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// DELETE /api/deliverable-deadlines/:id
exports.deleteDeadline = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "enseignant") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { id } = req.params;

    // Verify ownership
    const [rows] = await db.execute(
      `SELECT dd.id FROM deliverable_deadline dd
       JOIN assignment a ON a.team_id  = dd.team_id
       JOIN project p    ON p.id       = a.project_id
       WHERE dd.id = ? AND p.teacher_id = ?`,
      [id, user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Deadline not found or access denied" });
    }

    await db.execute("DELETE FROM deliverable_deadline WHERE id = ?", [id]);
    res.json({ message: "Deadline deleted" });
  } catch (err) {
    console.error("deleteDeadline error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/deliverable-deadlines/for-student
// Returns deadlines for the student's own team
exports.getDeadlinesForStudent = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "etudiant") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Get student's team
    const [teamRows] = await db.execute(
      `SELECT tm.team_id FROM team_member tm
       WHERE tm.student_id = ? AND tm.status = 'ACCEPTED'
       LIMIT 1`,
      [user.id]
    );
    if (teamRows.length === 0) return res.json({ deadlines: [] });

    const teamId = teamRows[0].team_id;

    const [deadlines] = await db.execute(
      `SELECT id, deliverable_type, deadline_date, deadline_time
       FROM deliverable_deadline
       WHERE team_id = ?
       ORDER BY deadline_date ASC, deliverable_type ASC`,
      [teamId]
    );

    res.json({ deadlines });
  } catch (err) {
    console.error("getDeadlinesForStudent error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};