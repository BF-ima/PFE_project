const db  = require("../config/db");
const jwt = require("jsonwebtoken");

const getUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [users] = await db.execute("SELECT id, role FROM users WHERE id = ?", [decoded.id]);
  if (users.length === 0) throw new Error("Utilisateur non trouvé");
  return users[0];
};

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });
  try {
    const user = await getUserFromToken(token);
    const [rows] = await db.execute(
      `SELECT id, type, title, message, is_read, created_at
       FROM notification
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [user.id]
    );
    res.json({ notifications: rows });
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });
  try {
    const user = await getUserFromToken(token);
    await db.execute(
      "UPDATE notification SET is_read = TRUE WHERE id = ? AND user_id = ?",
      [req.params.id, user.id]
    );
    res.json({ message: "Notification marquée comme lue" });
  } catch (err) {
    console.error("markAsRead error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PATCH /api/notifications/:id/unread
exports.markAsUnread = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });
  try {
    const user = await getUserFromToken(token);
    await db.execute(
      "UPDATE notification SET is_read = FALSE WHERE id = ? AND user_id = ?",
      [req.params.id, user.id]
    );
    res.json({ message: "Notification marquée comme non lue" });
  } catch (err) {
    console.error("markAsUnread error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PATCH /api/notifications/read-all
exports.markAllRead = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });
  try {
    const user = await getUserFromToken(token);
    await db.execute(
      "UPDATE notification SET is_read = TRUE WHERE user_id = ?",
      [user.id]
    );
    res.json({ message: "Toutes les notifications marquées comme lues" });
  } catch (err) {
    console.error("markAllRead error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};