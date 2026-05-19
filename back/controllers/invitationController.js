const db  = require("../config/db");
const jwt = require("jsonwebtoken");

const getUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [users] = await db.execute("SELECT id, role FROM users WHERE id = ?", [decoded.id]);
  if (users.length === 0) throw new Error("Utilisateur non trouvé");
  return users[0];
};

// GET /api/invitations
exports.getMyInvitations = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });
  try {
    const user = await getUserFromToken(token);
    const [rows] = await db.execute(
      `SELECT
         tm.id,
         tm.team_id,
         tm.status,
         tm.joined_at,
         CONCAT(lu.first_name, ' ', lu.last_name) AS sender_name,
         lu.email                                   AS sender_email
       FROM team_member tm
       JOIN team  t  ON t.id  = tm.team_id
       JOIN users lu ON lu.id = t.leader_id
       WHERE tm.student_id = ?
       ORDER BY tm.joined_at DESC`,
      [user.id]
    );
    res.json({ invitations: rows });
  } catch (err) {
    console.error("getMyInvitations error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PATCH /api/invitations/:memberId/accept
exports.acceptInvitation = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  const connection = await db.getConnection();
  try {
    const user = await getUserFromToken(token);

    await connection.beginTransaction();

    // Get the invitation and lock the team row simultaneously
    const [rows] = await connection.execute(
      "SELECT * FROM team_member WHERE id = ? AND student_id = ?",
      [req.params.memberId, user.id]
    );
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Invitation non trouvée" });
    }
    if (rows[0].status !== "PENDING") {
      await connection.rollback();
      return res.status(400).json({ message: "Invitation déjà traitée" });
    }

    const teamId = rows[0].team_id;

    // Lock the team row to prevent race conditions
    const [teams] = await connection.execute(
      `SELECT t.*, COALESCE(p.max_students, 2) AS max_students
       FROM team t
       LEFT JOIN project p ON p.id = t.project_id
       WHERE t.id = ? FOR UPDATE`,
      [teamId]
    );
    if (teams.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Équipe non trouvée" });
    }

    // Check student isn't already in another team
    const [alreadyMember] = await connection.execute(
      "SELECT id FROM team_member WHERE student_id = ? AND status = 'ACCEPTED' AND id != ?",
      [user.id, req.params.memberId]
    );
    if (alreadyMember.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: "Vous appartenez déjà à une équipe" });
    }

    // ✅ Re-check capacity at acceptance time (inside the lock)
    const [[{ count }]] = await connection.execute(
      "SELECT COUNT(*) AS count FROM team_member WHERE team_id = ? AND status = 'ACCEPTED'",
      [teamId]
    );

    if (count >= teams[0].max_students) {
      // Auto-reject — team is already full
      await connection.execute(
        "UPDATE team_member SET status = 'REJECTED' WHERE id = ?",
        [req.params.memberId]
      );
      await connection.commit();
      return res.status(400).json({
        message: "L'équipe est déjà complète. Votre invitation a été automatiquement refusée.",
      });
    }

    // All good — accept
    await connection.execute(
      "UPDATE team_member SET status = 'ACCEPTED', joined_at = NOW() WHERE id = ?",
      [req.params.memberId]
    );

    await connection.commit();
    res.json({ message: "Invitation acceptée" });

  } catch (err) {
    await connection.rollback();
    console.error("acceptInvitation error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    connection.release();
  }
};

// PATCH /api/invitations/:memberId/decline
exports.declineInvitation = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });
  try {
    const user = await getUserFromToken(token);

    const [rows] = await db.execute(
      "SELECT * FROM team_member WHERE id = ? AND student_id = ?",
      [req.params.memberId, user.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Invitation non trouvée" });
    if (rows[0].status !== "PENDING")
      return res.status(400).json({ message: "Invitation déjà traitée" });

    await db.execute(
      "UPDATE team_member SET status = 'REJECTED' WHERE id = ?",
      [req.params.memberId]
    );
    res.json({ message: "Invitation refusée" });
  } catch (err) {
    console.error("declineInvitation error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};