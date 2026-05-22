// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const db = require("../config/db");


authenticate = async (req, res, next) => {
  // Try header first, then cookies
  let token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;

  if (!token) {
    return console.log( "Non authentifié - Token manquant");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await db.execute(
      "SELECT id, email, role, created_by FROM users WHERE id = ?",
      [decoded.id]
    );

    if (!users[0]) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    req.user = {
      id: users[0].id,
      email: users[0].email,
      role: users[0].role,
      created_by: users[0].created_by,
    };

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

module.exports = authenticate ;