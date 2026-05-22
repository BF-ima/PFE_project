const db  = require("../config/db");
const jwt = require("jsonwebtoken");
// -----------------------------------------------------------------------------
// SEARCH USER BY EMAIL  →  GET /api/users/search?email=xxx
// Used by AddMemberModal to get the student_id before sending a join request
// -----------------------------------------------------------------------------
exports.searchUserByEmail = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });
 
  try {
    const { email } = req.query;
 
    if (!email) {
      return res.status(400).json({ message: "Email est requis" });
    }
 
    const [users] = await db.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.role
       FROM users u
       WHERE u.email = ? AND u.role = 'etudiant' AND u.is_active = 1`,
      [email]
    );
 
    if (users.length === 0) {
      return res.status(404).json({ message: "Aucun étudiant trouvé avec cet email" });
    }
 
    res.json({ user: users[0] });
 
  } catch (err) {
    console.error("searchUserByEmail error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};