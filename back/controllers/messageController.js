// controllers/messageController.js  (full file)
const db  = require("../config/db");
const jwt = require("jsonwebtoken");

const getUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [users] = await db.execute(
    "SELECT id, role, first_name, last_name, email FROM users WHERE id = ?",
    [decoded.id]
  );
  if (users.length === 0) throw new Error("Utilisateur non trouvé");
  return users[0];
};

const canAccessGroup = async (userId, teamId, groupType) => {
  const [member] = await db.execute(
    "SELECT 1 FROM team_member WHERE team_id = ? AND student_id = ? LIMIT 1",
    [teamId, userId]
  );
  if (member.length > 0) return true;

  if (groupType === "team_supervisor") {
    const [sup] = await db.execute(
      `SELECT 1 FROM group_conversation
       WHERE team_id = ? AND group_type = 'team_supervisor' AND supervisor_id = ? LIMIT 1`,
      [teamId, userId]
    );
    if (sup.length > 0) return true;
  }
  return false;
};

exports.getConversations = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    let rows = [];

    if (user.role === "etudiant") {
      [rows] = await db.execute(
       `SELECT gc.id AS conv_id, gc.team_id, gc.group_type, gc.supervisor_id, gc.created_at
        FROM group_conversation gc
        JOIN team_member tm ON tm.team_id = gc.team_id
        WHERE tm.student_id = ? AND tm.status = 'ACCEPTED'
        ORDER BY gc.group_type ASC`,
       [user.id]
      );
    } else if (["enseignant", "admin", "super_admin"].includes(user.role)) {
      [rows] = await db.execute(
        `SELECT gc.id AS conv_id, gc.team_id, gc.group_type, gc.supervisor_id, gc.created_at
         FROM group_conversation gc
         WHERE gc.supervisor_id = ? AND gc.group_type = 'team_supervisor'`,
        [user.id]
      );
    }

    const conversations = await Promise.all(
  rows.map(async (gc) => {
    const [members] = await db.execute(
      `SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) AS name, u.email
       FROM users u
       JOIN team_member tm ON tm.student_id = u.id
       WHERE tm.team_id = ? AND tm.status = 'ACCEPTED'`,
      [gc.team_id]
    );

    let supervisor = null;
    if (gc.supervisor_id) {
      const [supRows] = await db.execute(
        "SELECT id, CONCAT(first_name, ' ', last_name) AS name, email FROM users WHERE id = ?",
        [gc.supervisor_id]
      );
      supervisor = supRows[0] || null;
    }

    const [lastMsg] = await db.execute(
      `SELECT content, created_at FROM group_message
       WHERE group_conversation_id = ?
       ORDER BY created_at DESC LIMIT 1`,
      [gc.conv_id]
    );

    const [unreadRow] = await db.execute(
      `SELECT COUNT(*) AS cnt FROM group_message
       WHERE group_conversation_id = ? AND sender_id != ? AND is_read = 0`,
      [gc.conv_id, user.id]
    );

    // ── ADD THIS ──────────────────────────────────────────────────────────
    const [leaderRows] = await db.execute(
      `SELECT CONCAT(u.first_name, ' ', u.last_name) AS name
       FROM users u
       JOIN team_member tm ON tm.student_id = u.id
       WHERE tm.team_id = ? AND tm.status = 'ACCEPTED'
       ORDER BY tm.joined_at ASC
       LIMIT 1`,
      [gc.team_id]
    );
    const leaderName = leaderRows[0]?.name || 'Unknown team';
    // ─────────────────────────────────────────────────────────────────────

    return {
      id:          gc.conv_id,
      team_id:     gc.team_id,
      group_type:  gc.group_type,
      name: gc.group_type === "team"
        ? "My team"
        : user.role === "etudiant"
          ? "Team + Supervisor"
          : leaderName,
      description: gc.group_type === "team"
        ? "Conversation with my team members"
        : user.role === "etudiant"
          ? "Conversation with my team members and our supervisor"
          : `${leaderName}'s team`,
      members:     supervisor ? [...members, supervisor] : members,
      supervisor,
      lastMessage: lastMsg[0]?.content || "",
      time:        lastMsg[0]?.created_at || gc.created_at,
      unread:      unreadRow[0]?.cnt || 0,
    };
  })
);

    res.json({ conversations });
  } catch (err) {
    console.error("getConversations error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getMessages = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user   = await getUserFromToken(token);
    const convId = parseInt(req.params.convId);

    const [convRows] = await db.execute("SELECT * FROM group_conversation WHERE id = ?", [convId]);
    if (convRows.length === 0) return res.status(404).json({ message: "Conversation introuvable" });

    const conv = convRows[0];
    const allowed = await canAccessGroup(user.id, conv.team_id, conv.group_type);
    if (!allowed) return res.status(403).json({ message: "Accès refusé" });

    await db.execute(
      `UPDATE group_message SET is_read = 1
       WHERE group_conversation_id = ? AND sender_id != ? AND is_read = 0`,
      [convId, user.id]
    );

    const [messages] = await db.execute(
  `SELECT gm.id, gm.sender_id, gm.content, gm.file_name, gm.file_type,
          gm.is_read, gm.created_at,
          CONCAT(u.first_name, ' ', u.last_name) AS sender_name
   FROM group_message gm
   JOIN users u ON u.id = gm.sender_id
   WHERE gm.group_conversation_id = ?
   ORDER BY gm.created_at ASC`,
  [convId]
);

    res.json({ messages });
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.sendMessage = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    const { conv_id, content } = req.body;

    if (!conv_id || !content?.trim()) {
      return res.status(400).json({ message: "conv_id et content sont requis" });
    }

    const [convRows] = await db.execute("SELECT * FROM group_conversation WHERE id = ?", [conv_id]);
    if (convRows.length === 0) return res.status(404).json({ message: "Conversation introuvable" });

    const conv = convRows[0];
    const allowed = await canAccessGroup(user.id, conv.team_id, conv.group_type);
    if (!allowed) return res.status(403).json({ message: "Accès refusé" });

    const [result] = await db.execute(
      `INSERT INTO group_message (group_conversation_id, sender_id, content, is_read, created_at)
       VALUES (?, ?, ?, 0, NOW())`,
      [conv_id, user.id, content.trim()]
    );

    const [newMsg] = await db.execute(
      `SELECT gm.id, gm.sender_id, gm.content, gm.is_read, gm.created_at,
              CONCAT(u.first_name, ' ', u.last_name) AS sender_name
       FROM group_message gm JOIN users u ON u.id = gm.sender_id
       WHERE gm.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ message: newMsg[0] });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.markAsRead = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user   = await getUserFromToken(token);
    const convId = parseInt(req.params.convId);

    await db.execute(
      `UPDATE group_message SET is_read = 1
       WHERE group_conversation_id = ? AND sender_id != ? AND is_read = 0`,
      [convId, user.id]
    );

    res.json({ message: "Messages marqués comme lus" });
  } catch (err) {
    console.error("markAsRead error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


//////////////////////////////////////////////////
//uploadfile
///////////////////////////////////////////////
exports.uploadFile = async (req, res) => {
  console.log('req.file:', req.file);       // ← is multer working?
  console.log('req.body:', req.body);       // ← is conv_id coming through?
  console.log('CLOUDINARY ENV:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // ← are env vars loaded?
    api_key:    process.env.CLOUDINARY_API_KEY,
  });



  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    const { conv_id } = req.body;
    if (!conv_id) {
      return res.status(400).json({ message: "conv_id est requis" });
    }

    const [convRows] = await db.execute(
      "SELECT * FROM group_conversation WHERE id = ?", [conv_id]
    );
    if (convRows.length === 0)
      return res.status(404).json({ message: "Conversation introuvable" });

    const conv = convRows[0];
    const allowed = await canAccessGroup(user.id, conv.team_id, conv.group_type);
    if (!allowed) return res.status(403).json({ message: "Accès refusé" });

    // ✅ Cloudinary gives a full https:// URL directly
const isImage = req.file.mimetype.startsWith('image/');
const fileUrl = isImage 
  ? req.file.path  // Cloudinary image URL works as-is
  : req.file.path.replace('/image/upload/', '/raw/upload/'); // fix raw URL

    const [result] = await db.execute(
      `INSERT INTO group_message
         (group_conversation_id, sender_id, content, file_name, file_type, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, 0, NOW())`,
      [conv_id, user.id, fileUrl, req.file.originalname, isImage ? 'image' : 'file']
    );

    const [newMsg] = await db.execute(
      `SELECT gm.id, gm.sender_id, gm.content, gm.file_name, gm.file_type,
              gm.is_read, gm.created_at,
              CONCAT(u.first_name, ' ', u.last_name) AS sender_name
       FROM group_message gm JOIN users u ON u.id = gm.sender_id
       WHERE gm.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ message: newMsg[0] });

  } catch (err) {
    console.error("uploadFile error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

///////////////////////////////////////////
//downloadfile
////////////////////////////////////////
exports.downloadFile = async (req, res) => {
  const { url, name } = req.query;
  if (!url) return res.status(400).json({ message: 'URL manquante' });

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fichier introuvable');

    const buffer = await response.arrayBuffer();
    //res.setHeader('Content-Disposition', `inline; filename="${name || 'fichier'}"`);//inline عرض في المتصفح
    res.setHeader('Content-Disposition', `attachment; filename="${name || 'fichier'}"`); //attachment → force download (not open in browser)
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('downloadFile error:', err);
    res.status(500).json({ message: 'Erreur téléchargement' });
  }
};