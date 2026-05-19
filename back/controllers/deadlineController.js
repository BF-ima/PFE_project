const db  = require("../config/db");
const jwt = require("jsonwebtoken");

const getUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [users] = await db.execute("SELECT id, role FROM users WHERE id = ?", [decoded.id]);
  if (users.length === 0) throw new Error("Utilisateur non trouvé");
  return users[0];
};

// GET /api/deadline
exports.getDeadline = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, deadline_date, deadline_time, send_reminder, send_urgent, created_at, updated_at
       FROM deadline_settings
       ORDER BY updated_at DESC
       LIMIT 1`
    );
    if (rows.length === 0) return res.json({ deadline: null });
    res.json({ deadline: rows[0] });
  } catch (err) {
    console.error("getDeadline error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// POST /api/deadline  (admin only)
exports.setDeadline = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });
  try {
    const user = await getUserFromToken(token);
    if (user.role !== "super_admin" && user.role !== "admin" && user.role !== "supervisor") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { date, time, sendReminder, sendUrgent } = req.body;
    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required" });
    }

    // Upsert: keep only one row (replace existing)
    await db.execute(
      `INSERT INTO deadline_settings (deadline_date, deadline_time, send_reminder, send_urgent, updated_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         deadline_date  = VALUES(deadline_date),
         deadline_time  = VALUES(deadline_time),
         send_reminder  = VALUES(send_reminder),
         send_urgent    = VALUES(send_urgent),
         updated_at     = NOW()`,
      [date, time, sendReminder ? 1 : 0, sendUrgent ? 1 : 0]
    );

    // Optionally: schedule notifications here (cron / queue)

    res.json({ message: "Deadline saved successfully" });
  } catch (err) {
    console.error("setDeadline error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// DELETE /api/deadline  (admin only)
exports.deleteDeadline = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });
  try {
    const user = await getUserFromToken(token);
    if (user.role !== "admin" && user.role !== "supervisor") {
      return res.status(403).json({ message: "Accès refusé" });
    }
    await db.execute("DELETE FROM deadline_settings");
    res.json({ message: "Deadline deleted" });
  } catch (err) {
    console.error("deleteDeadline error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};