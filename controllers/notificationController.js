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
    const unread_count = rows.filter(n => !n.is_read).length;
    res.json({ notifications: rows, unread_count });
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



// POST /api/notifications/broadcast
exports.broadcastNotification = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const { type, title, message, role } = req.body;

    console.log("broadcast received:", { type, title, message, role });

    if (!type || !title || !message || !role) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Get team_ids that have already submitted
    const [submittedTeams] = await db.execute(
      `SELECT DISTINCT team_id 
       FROM wish 
       WHERE status = 'SUBMITTED' AND team_id IS NOT NULL`
    );
    const submittedTeamIds = submittedTeams.map(r => r.team_id);

    console.log("Submitted team_ids:", submittedTeamIds);

    let users = [];

    if (submittedTeamIds.length === 0) {
      // No team submitted yet → notify all active students
      const [rows] = await db.execute(
        "SELECT id FROM users WHERE role = ? AND is_active = 1",
        [role]
      );
      users = rows;
    } else {
      const placeholders = submittedTeamIds.map(() => "?").join(",");

      const [rows] = await db.execute(
        `-- Students in a team that has NOT submitted
         SELECT DISTINCT u.id
         FROM users u
         INNER JOIN team_member tm ON tm.student_id = u.id
         WHERE u.role = ?
           AND u.is_active = 1
           AND tm.status = 'ACCEPTED'
           AND tm.team_id NOT IN (${placeholders})

         UNION

         -- Students who have no team at all
         SELECT u.id
         FROM users u
         WHERE u.role = ?
           AND u.is_active = 1
           AND u.id NOT IN (
             SELECT student_id FROM team_member WHERE status = 'ACCEPTED'
           )`,
        [role, ...submittedTeamIds, role]
      );
      users = rows;
    }

    console.log(`Sending to ${users.length} users who haven't submitted`);

    if (users.length === 0) {
      return res.status(200).json({ message: "All students have already submitted their wishlist" });
    }

    for (const u of users) {
      await db.execute(
        `INSERT INTO notification (user_id, type, title, message, is_read, created_at)
         VALUES (?, ?, ?, ?, 0, NOW())`,
        [u.id, type, title, message]
      );
      console.log(`Inserted notification for user ${u.id}`);
    }

    res.json({ message: `Notification sent to ${users.length} users who haven't submitted` });













    
  } catch (err) {
    console.error("broadcastNotification error:", err);
    res.status(500).json({ message: err.message || "Erreur serveur" });
  }
};