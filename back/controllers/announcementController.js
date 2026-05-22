const db  = require("../config/db");
const jwt = require("jsonwebtoken");

const getUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [users] = await db.execute("SELECT id, role FROM users WHERE id = ?", [decoded.id]);
  if (users.length === 0) throw new Error("Utilisateur non trouvé");
  return users[0];
};


exports.getAnnouncements = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);

    // Map your actual DB role values
    const adminRoles      = ["admin", "super_admin"];
    const supervisorRoles = ["supervisor", "enseignant"];   // ← add your real role names
    const studentRoles    = ["student", "etudiant"];        // ← add your real role names

    let rows;

    if (adminRoles.includes(user.role)) {
      // Admins see everything
      [rows] = await db.execute(
        "SELECT * FROM announcement ORDER BY created_at DESC"
      );
    } else if (supervisorRoles.includes(user.role)) {
      [rows] = await db.execute(
        "SELECT * FROM announcement WHERE audience IN (?, ?) ORDER BY created_at DESC",
        ["All users", "Supervisors"]
      );
    } else if (studentRoles.includes(user.role)) {
      [rows] = await db.execute(
        "SELECT * FROM announcement WHERE audience IN (?, ?) ORDER BY created_at DESC",
        ["All users", "Students"]
      );
    } else {
      // Unknown role — return empty rather than crashing
      console.warn(`Unknown role "${user.role}" — returning empty announcements`);
      rows = [];
    }

    res.json({ announcements: rows });
  } catch (err) {
    console.error("getAnnouncements error:", err);
    res.status(500).json({ message: "Erreur serveur", detail: err.message });
  }
};

// POST /api/announcements
exports.createAnnouncement = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);

    // Admin, super_admin AND supervisor can create announcements
    const canCreate = ["admin", "super_admin", "supervisor", "enseignant"];
      if (!canCreate.includes(user.role)) { 
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { title, description, audience, type } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Le titre est requis" });

    // Supervisors can only target Students (they announce to their students)
    const validAudiences = ["All users", "Supervisors", "Students"];
    let safeAudience = validAudiences.includes(audience) ? audience : "All users";
    if (user.role === "supervisor") safeAudience = "Students";

    const validTypes = ["normal", "important", "urgent", "info", "alert", "reminder"];
    const safeType = validTypes.includes(type) ? type : "normal";

    const [result] = await db.execute(
      `INSERT INTO announcement (title, description, audience, type, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [title.trim(), description?.trim() || "", safeAudience, safeType, user.id]
    );

    res.status(201).json({ message: "Annonce créée", announcementId: result.insertId });
  } catch (err) {
    console.error("createAnnouncement error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};