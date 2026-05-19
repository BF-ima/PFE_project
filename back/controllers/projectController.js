const db  = require("../config/db");
const jwt = require("jsonwebtoken");

// ADD after line 6 (after the db require):
const sendNotification = async (userId, type, title, message) => {
  await db.execute(
    `INSERT INTO notification (user_id, type, title, message, is_read, created_at)
     VALUES (?, ?, ?, ?, 0, NOW())`,
    [userId, type, title, message]
  );
};

// Helper — get supervisor info from token
const getSupervisorFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [users] = await db.execute(
    "SELECT id, role, first_name, last_name FROM users WHERE id = ?",
    [decoded.id]
  );
  if (users.length === 0) throw new Error("Utilisateur non trouvé");

  return users[0];
};

// -----------------------------------------------------------------------------
// CREATE PROJECT
// -----------------------------------------------------------------------------
exports.createProject = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const supervisor = await getSupervisorFromToken(token);
    if (supervisor.role !== "enseignant" && supervisor.role !== "entreprise") {
    throw new Error("Accès refusé. Seuls les superviseurs peuvent créer des projets");
    }
    const { title, max_students, description, speciality_id } = req.body;

    if (!title || !max_students) {
      return res.status(400).json({ message: "Titre et nombre max d'étudiants sont requis" });
    }

    // Set teacher_id or external_supervisor_id based on role
    const teacher_id            = supervisor.role === "enseignant"  ? supervisor.id : null;
    const external_supervisor_id = supervisor.role === "entreprise" ? supervisor.id : null;

    const [result] = await db.execute(
  `INSERT INTO project 
    (title, description, max_students, status, teacher_id, external_supervisor_id, speciality_id, created_at)
   VALUES (?, ?, ?, 'PENDING', ?, ?, ?, NOW())`,
  [
    title,
    description || null,
    parseInt(max_students),
    teacher_id,
    external_supervisor_id,
    speciality_id || null,   // ← add this
  ]
);

// ── Notify all super_admins ────────────────────────────────────
const [admins] = await db.execute(
  "SELECT id FROM users WHERE role = 'super_admin' AND is_active = 1"
);
for (const admin of admins) {
  await db.execute(
    `INSERT INTO notification (user_id, type, title, message, is_read, created_at)
     VALUES (?, 'info', 'New Project Submitted', ?, 0, NOW())`,
    [admin.id,`${supervisor.first_name} ${supervisor.last_name} has submitted a new project: "${title}". Please review it.`]
  );
}

    res.status(201).json({
      message:   "Projet créé avec succès",
      projectId: result.insertId,
    });

  } catch (err) {
    console.error("createProject error:", err);
    if (err.message.includes("Accès refusé")) {
      return res.status(403).json({ message: err.message });
    }
    res.status(500).json({ message: "Erreur serveur lors de la création du projet" });
  }
};

// -----------------------------------------------------------------------------
// GET MY PROJECTS (for the logged-in supervisor)
// -----------------------------------------------------------------------------
exports.getMyProjects = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const supervisor = await getSupervisorFromToken(token);

    let query;
    if (supervisor.role === "enseignant") {
      query = `
  SELECT p.id, p.title, p.status, p.created_at, p.max_students, p.description,
         p.speciality_id, sp.name AS speciality_name
  FROM project p
  LEFT JOIN speciality sp ON p.speciality_id = sp.id
  WHERE p.teacher_id = ?
  ORDER BY p.created_at DESC
`;
    } else {
      query = `
        SELECT id, title, status, created_at, max_students, description
        FROM project
        WHERE external_supervisor_id = ?
        ORDER BY created_at DESC
      `;
    }

    const [projects] = await db.execute(query, [supervisor.id]);
    res.json({ projects });

  } catch (err) {
    console.error("getMyProjects error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// GET SINGLE PROJECT
// -----------------------------------------------------------------------------
exports.getProjectById = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const { id } = req.params;

    const [projects] = await db.execute(
      `SELECT p.*,
              CONCAT(t.first_name, ' ', t.last_name)  AS teacher_name,
              t.email                                   AS teacher_email,
              t.phone                                   AS teacher_phone,                  
              CONCAT(e.first_name, ' ', e.last_name)  AS external_supervisor_name,
              e.email                                   AS external_supervisor_email,
              e.phone                                   AS external_supervisor_phone,
              s.name                                    AS speciality_name,
              s.code                                    AS speciality_code
       FROM project p
       LEFT JOIN users t ON p.teacher_id             = t.id
       LEFT JOIN users e ON p.external_supervisor_id = e.id
       LEFT JOIN speciality s ON p.speciality_id = s.id
       WHERE p.id = ?`,
      [id]
    );

    if (projects.length === 0) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }

    res.json({ project: projects[0] });

  } catch (err) {
    console.error("getProjectById error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// DELETE PROJECT
// -----------------------------------------------------------------------------
exports.deleteProject = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const supervisor = await getSupervisorFromToken(token);
    const { id } = req.params;

    const whereClause = supervisor.role === "enseignant"
      ? "id = ? AND teacher_id = ?"
      : "id = ? AND external_supervisor_id = ?";

    const [existing] = await db.execute(
      `SELECT id FROM project WHERE ${whereClause}`,
      [id, supervisor.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Projet non trouvé ou accès refusé" });
    }

    await db.execute("DELETE FROM project WHERE id = ?", [id]);
    res.json({ message: "Projet supprimé avec succès" });

  } catch (err) {
    console.error("deleteProject error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// -----------------------------------------------------------------------------
// UPDATE PROJECT
// -----------------------------------------------------------------------------
exports.updateProject = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const supervisor = await getSupervisorFromToken(token);
    const { id }     = req.params;
    const { title, max_students, description, speciality_id } = req.body;

    if (!title || !max_students) {
      return res.status(400).json({ message: "Titre et nombre max d'étudiants sont requis" });
    }

    // Check project belongs to this supervisor
    const whereClause = supervisor.role === "enseignant"
      ? "id = ? AND teacher_id = ?"
      : "id = ? AND external_supervisor_id = ?";

    const [existing] = await db.execute(
      `SELECT id FROM project WHERE ${whereClause}`,
      [id, supervisor.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Projet non trouvé ou accès refusé" });
    }

    await db.execute(
  `UPDATE project SET title = ?, description = ?, max_students = ?, speciality_id = ? WHERE id = ?`,
  [title, description || null, parseInt(max_students), speciality_id || null, id]
);

    res.json({ message: "Projet modifié avec succès" });

  } catch (err) {
    console.error("updateProject error:", err);
    if (err.message.includes("Accès refusé")) {
      return res.status(403).json({ message: err.message });
    }
    res.status(500).json({ message: "Erreur serveur lors de la modification" });
  }
};


// -----------------------------------------------------------------------------
// GET ALL PROJECTS (for admin dashboard)
// -----------------------------------------------------------------------------
exports.getAllProjects = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getSupervisorFromToken(token);

    const allowedRoles = ["super_admin", "admin", "enseignant", "entreprise", "etudiant"];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // ── read optional ?status= query param ──────────────────────────────────
    const { status } = req.query;

    const validStatuses = ["PENDING", "VALIDATED", "REJECTED", "ASSIGNED", "COMPLETED"];

    let query = `
      SELECT p.*,
       CONCAT(t.first_name, ' ', t.last_name) AS teacher_name,
       CONCAT(e.first_name, ' ', e.last_name) AS external_supervisor_name,
       sp.name AS speciality_name 
FROM project p
LEFT JOIN users t       ON p.teacher_id             = t.id
LEFT JOIN users e       ON p.external_supervisor_id = e.id
LEFT JOIN speciality sp ON p.speciality_id          = sp.id 
    `;
    const params = [];

    if (status && validStatuses.includes(status.toUpperCase())) {
      query += " WHERE p.status = ?";
      params.push(status.toUpperCase());
    }

    query += " ORDER BY p.created_at DESC";

    const [projects] = await db.execute(query, params);
    res.json({ projects });

  } catch (err) {
    console.error("getAllProjects error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// UPDATE PROJECT STATUS (approve / reject)
// -----------------------------------------------------------------------------
exports.updateProjectStatus = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const { id }                    = req.params;
    const { status, comment, reason } = req.body;

    const allowed = ["PENDING", "VALIDATED", "REJECTED", "ASSIGNED", "COMPLETED"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const [existing] = await db.execute("SELECT id FROM project WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }

    if (status === "VALIDATED") {
      await db.execute(
        "UPDATE project SET status = ?, approval_comment = ? WHERE id = ?",
        [status, comment || null, id]
      );
    } else if (status === "REJECTED") {
      await db.execute(
        "UPDATE project SET status = ?, rejection_reason = ? WHERE id = ?",
        [status, reason || null, id]
      );
    } else {
      await db.execute(
        "UPDATE project SET status = ? WHERE id = ?",
        [status, id]
      );
    }

    // ADD after line 321 (after the if/else UPDATE block, before res.json):

// Fetch project + supervisor to notify
const [projData] = await db.execute(
  `SELECT p.title,
          p.teacher_id,
          p.external_supervisor_id,
          p.approval_comment,
          p.rejection_reason
   FROM project p WHERE p.id = ?`,
  [id]
);
const proj         = projData[0];
const supervisorId = proj?.teacher_id || proj?.external_supervisor_id;

if (supervisorId) {
  if (status === "VALIDATED") {
    const reasonText = comment
      ? `\n✅ Approval note: ${comment}`
      : "";
    await sendNotification(
      supervisorId,
      "info",
      "Project Approved",
      `Your project "${proj.title}" has been approved by the administration.${reasonText}`
    );
  } else if (status === "REJECTED") {
    const reasonText = reason
      ? `\n❌ Reason: ${reason}`
      : "";
    await sendNotification(
      supervisorId,
      "alert",
      "Project Rejected",
      `Your project "${proj.title}" has been rejected.${reasonText}`
    );
  }
}

    res.json({ message: "Statut mis à jour avec succès" });

  } catch (err) {
    console.error("updateProjectStatus error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// -----------------------------------------------------------------------------
// message history
// -----------------------------------------------------------------------------
exports.getProjectMessages = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const { id } = req.params;
    const [messages] = await db.execute(
      `SELECT m.id, m.content, m.created_at,
              m.sender_id,
              CONCAT(u.first_name, ' ', u.last_name) AS sender_name,
              u.role AS sender_role
       FROM project_message m
       JOIN users u ON m.sender_id = u.id
       WHERE m.project_id = ?
       ORDER BY m.created_at ASC
       LIMIT 100`,
      [id]
    );
    res.json({ messages });
  } catch (err) {
    console.error("getProjectMessages error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


exports.getValidatedProjects = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
  
const [projects] = await db.execute(
  `SELECT p.id, p.title, p.description, p.created_at, p.max_students,
          p.speciality_id,
          CONCAT(t.first_name, ' ', t.last_name) AS supervisor_name,
          CONCAT(e.first_name, ' ', e.last_name) AS external_supervisor_name
   FROM project p
   LEFT JOIN users t ON p.teacher_id             = t.id
   LEFT JOIN users e ON p.external_supervisor_id = e.id
   WHERE p.status IN ('VALIDATED', 'ASSIGNED')
   ORDER BY p.created_at DESC`,
  []
);

    res.json({ projects });

  } catch (err) {
    console.error("getValidatedProjects error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};