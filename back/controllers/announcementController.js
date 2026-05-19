const db  = require("../config/db");
const jwt = require("jsonwebtoken");

const getUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [users] = await db.execute("SELECT id, role FROM users WHERE id = ?", [decoded.id]);
  if (users.length === 0) throw new Error("Utilisateur non trouvé");
  return users[0];
};

// GET /api/announcements
exports.getAnnouncements = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });
  try {
    const [rows] = await db.execute(
      "SELECT * FROM announcement ORDER BY created_at DESC"
    );
    res.json({ announcements: rows });
  } catch (err) {
    console.error("getAnnouncements error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// POST /api/announcements  (admin only)
exports.createAnnouncement = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });
  try {
    const user = await getUserFromToken(token);
    if (!["admin", "super_admin"].includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    const { title, description, audience, type } = req.body;
    if (!title) return res.status(400).json({ message: "Le titre est requis" });

    const [result] = await db.execute(
      `INSERT INTO announcement (title, description, audience, type, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [title, description || "", audience || "All users", type || "normal", user.id]
    );
    res.status(201).json({ message: "Annonce créée", announcementId: result.insertId });
  } catch (err) {
    console.error("createAnnouncement error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};