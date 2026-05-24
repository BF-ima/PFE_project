const db  = require("../config/db");
const jwt = require("jsonwebtoken");

const getUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [users] = await db.execute(
    "SELECT id, role FROM users WHERE id = ?",
    [decoded.id]
  );
  if (users.length === 0) throw new Error("Utilisateur non trouvé");
  return users[0];
};

const getStudentTeam = async (userId) => {
  const [rows] = await db.execute(
    `SELECT tm.team_id FROM team_member tm
     WHERE tm.student_id = ? AND tm.status = 'ACCEPTED'
     LIMIT 1`,
    [userId]
  );
  return rows[0]?.team_id || null;
};

const getTeamProject = async (teamId) => {
  const [rows] = await db.execute(
    `SELECT project_id FROM assignment WHERE team_id = ? LIMIT 1`,
    [teamId]
  );
  return rows[0]?.project_id || null;
};

const isTeamLeader = async (userId, teamId) => {
  const [rows] = await db.execute(
    "SELECT leader_id FROM team WHERE id = ?",
    [teamId]
  );
  return rows.length > 0 && rows[0].leader_id === userId;
};

const notifyExternalSupervisor = async (projectId, teamId, message) => {
  const [[project]] = await db.execute(
    "SELECT external_supervisor_id, title FROM project WHERE id = ?",
    [projectId]
  );
  if (!project?.external_supervisor_id) return;

  await db.execute(
    `INSERT INTO notification (user_id, type, title, message, is_read, created_at)
     VALUES (?, 'INFO', 'New Deliverable Submitted', ?, 0, NOW())`,
    [project.external_supervisor_id, message]
  );
};

// ── GET /api/documents ─────────────────────────────────────────────────────
exports.getDocuments = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    let rows;

    if (user.role === "etudiant") {
      const teamId    = await getStudentTeam(user.id);
      const projectId = teamId ? await getTeamProject(teamId) : null;

      let teacherId = 0, externalSupervisorId = 0;
      if (projectId) {
        const [[proj]] = await db.execute(
          "SELECT teacher_id, external_supervisor_id FROM project WHERE id = ?",
          [projectId]
        );
        teacherId            = proj?.teacher_id            || 0;
        externalSupervisorId = proj?.external_supervisor_id || 0;
      }

      [rows] = await db.execute(
        `SELECT d.id, d.name, d.type, d.file_path, d.file_size,
                d.created_at, d.project_id,
                CONCAT(u.first_name, ' ', u.last_name) AS uploaded_by
         FROM document d
         LEFT JOIN users u ON u.id = d.uploaded_by
         WHERE
           d.project_id = ?
           OR (
             d.project_id IS NULL
             AND d.uploaded_by IN (?, ?)
           )
         ORDER BY d.created_at DESC`,
        [projectId || 0, teacherId, externalSupervisorId]
      );

    } else if (["enseignant", "entreprise"].includes(user.role)) {
      // ✅ Supervisors see only their own uploaded documents
      [rows] = await db.execute(
        `SELECT d.id, d.name, d.type, d.file_path, d.file_size,
                d.created_at, d.project_id,
                p.title AS project_title,
                CONCAT(u.first_name, ' ', u.last_name) AS uploaded_by
         FROM document d
         LEFT JOIN users   u ON u.id = d.uploaded_by
         LEFT JOIN project p ON p.id = d.project_id
         WHERE d.uploaded_by = ?
         ORDER BY d.created_at DESC`,
        [user.id]
      );

    } else {
      // Admin/super_admin sees everything
      [rows] = await db.execute(
        `SELECT d.id, d.name, d.type, d.file_path, d.file_size,
                d.created_at, d.project_id,
                p.title AS project_title,
                CONCAT(u.first_name, ' ', u.last_name) AS uploaded_by
         FROM document d
         LEFT JOIN users   u ON u.id = d.uploaded_by
         LEFT JOIN project p ON p.id = d.project_id
         ORDER BY d.created_at DESC`
      );
    }

    res.json({ documents: rows || [] });
  } catch (err) {
    console.error("getDocuments error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── POST /api/documents ────────────────────────────────────────────────────
exports.uploadDocument = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    if (!["enseignant", "entreprise", "super_admin", "admin"].includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const file = req.file;
    if (!file) return res.status(400).json({ message: "Aucun fichier fourni" });

    const { title, file_type, project_id } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });

    const cloudinaryResult = await req.uploadToCloudinary(file.buffer, {
      folder:        "documents",
      resource_type: "raw",
      type:          "upload",
      public_id:     `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    });

    await db.execute(
      `INSERT INTO document (name, type, file_path, file_size, uploaded_by, project_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        title,
        file_type || 'Other',
        cloudinaryResult.secure_url,
        file.size,
        user.id,
        project_id || null,   // NULL = visible to all teams
      ]
    );

    res.status(201).json({ message: "Document uploaded successfully" });
  } catch (err) {
    console.error("uploadDocument error:", err);
    res.status(500).json({ message: err.message || "Erreur serveur" });
  }
};

// ── GET /api/documents/deliverables/my ────────────────────────────────────
exports.getMyDeliverables = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user      = await getUserFromToken(token);
    const teamId    = await getStudentTeam(user.id);
    if (!teamId) return res.json({ deliverables: [] });

    const projectId = await getTeamProject(teamId);
    if (!projectId) return res.json({ deliverables: [] });

    // FIX: filter by BOTH project_id AND team_id so each team sees only their own deliverables
    const [rows] = await db.execute(
      `SELECT d.*
       FROM deliverable d
       INNER JOIN (
         SELECT title, MAX(version) AS max_version
         FROM deliverable
         WHERE project_id = ? AND team_id = ?
         GROUP BY title
       ) latest ON d.title = latest.title AND d.version = latest.max_version
       WHERE d.project_id = ? AND d.team_id = ?
       ORDER BY d.uploaded_at DESC`,
      [projectId, teamId, projectId, teamId]
    );

    const deliverables = await Promise.all(
      rows.map(async (d) => {
        const [feedbacks] = await db.execute(
          `SELECT df.id, df.text, df.created_at, df.status,
                  CONCAT(u.first_name, ' ', u.last_name) AS supervisor_name
           FROM deliverable_feedback df
           JOIN users u ON df.supervisor_id = u.id
           WHERE df.deliverable_id = ?
           ORDER BY df.created_at ASC`,
          [d.id]
        );
        return { ...d, feedbacks };
      })
    );

    res.json({ deliverables });
  } catch (err) {
    console.error("getMyDeliverables error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── POST /api/documents/deliverables/upload ───────────────────────────────
exports.uploadDeliverable = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user      = await getUserFromToken(token);
    const teamId    = await getStudentTeam(user.id);
    if (!teamId) return res.status(400).json({ message: "Vous n'appartenez à aucune équipe" });

      // ── LEADER CHECK ──────────────────────────────────────────────────────
    const leader = await isTeamLeader(user.id, teamId);
    if (!leader) return res.status(403).json({ message: "Seul le leader de l'équipe peut soumettre des livrables" });
      // ─────────────────────────────────────────────────────────────────────

    const projectId = await getTeamProject(teamId);
    if (!projectId) return res.status(400).json({ message: "Aucun projet assigné à votre équipe" });

    const file = req.file;
    if (!file) return res.status(400).json({ message: "Aucun fichier fourni" });

    const { title, file_type } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });

    // FIX: check approval scoped to this team only
    const [latest] = await db.execute(
      `SELECT status FROM deliverable
       WHERE project_id = ? AND team_id = ? AND title = ?
       ORDER BY version DESC LIMIT 1`,
      [projectId, teamId, title]
    );
    if (latest.length > 0 && latest[0].status === "APPROVED") {
      return res.status(403).json({ message: "This deliverable has been approved and cannot be re-uploaded." });
    }

    const cloudinaryResult = await req.uploadToCloudinary(file.buffer, {
      folder:        "deliverables",
      resource_type: "raw",
      type:          "upload",
      public_id:     `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    });

    const fileUrl = cloudinaryResult.secure_url;

    // FIX: version scoped to this team only
    const [existing] = await db.execute(
      "SELECT MAX(version) AS max_version FROM deliverable WHERE project_id = ? AND team_id = ? AND title = ?",
      [projectId, teamId, title]
    );
    const version = (existing[0]?.max_version || 0) + 1;

    // FIX: store team_id with the deliverable
    await db.execute(
      `INSERT INTO deliverable (project_id, team_id, title, file_path, file_type, version, uploaded_at, status)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), 'PENDING')`,
      [projectId, teamId, title, fileUrl, file_type || file.mimetype, version]
    );


    // Notify external supervisor if this is Source Code Repository
if (title === 'Source Code Repository') {
  await notifyExternalSupervisor(
    projectId,
    teamId,
    `A team has submitted a new version of the Source Code Repository for project "${title}".`
  );
}

    res.status(201).json({ message: "Deliverable uploaded successfully" });
  } catch (err) {
    console.error("uploadDeliverable error:", err);
    res.status(500).json({ message: err.message || "Erreur serveur" });
  }
};

// ── POST /api/documents/deliverables/repo ─────────────────────────────────
exports.submitRepoUrl = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user      = await getUserFromToken(token);
    const teamId    = await getStudentTeam(user.id);
    if (!teamId) return res.status(400).json({ message: "Vous n'appartenez à aucune équipe" });

      // ── LEADER CHECK ──────────────────────────────────────────────────────
    const leader = await isTeamLeader(user.id, teamId);
    if (!leader) return res.status(403).json({ message: "Seul le leader de l'équipe peut soumettre des livrables" });
      // ─────────────────────────────────────────────────────────────────────

    const projectId = await getTeamProject(teamId);
    if (!projectId) return res.status(400).json({ message: "Aucun projet assigné à votre équipe" });

    const { repo_url } = req.body;
    if (!repo_url) return res.status(400).json({ message: "URL manquante" });

    // FIX: check approval scoped to this team
    const [latest] = await db.execute(
      `SELECT status FROM deliverable
       WHERE project_id = ? AND team_id = ? AND title = 'Source Code Repository'
       ORDER BY version DESC LIMIT 1`,
      [projectId, teamId]
    );
    if (latest.length > 0 && latest[0].status === "APPROVED") {
      return res.status(403).json({ message: "This deliverable has been approved and cannot be changed." });
    }

    // FIX: version scoped to this team
    const [existing] = await db.execute(
      `SELECT id, version FROM deliverable
       WHERE project_id = ? AND team_id = ? AND title = 'Source Code Repository'
       ORDER BY version DESC LIMIT 1`,
      [projectId, teamId]
    );

    if (existing.length > 0) {
      await db.execute(
        `INSERT INTO deliverable (project_id, team_id, title, file_path, file_type, version, uploaded_at, status)
         VALUES (?, ?, 'Source Code Repository', ?, 'url', ?, NOW(), 'PENDING')`,
        [projectId, teamId, repo_url, existing[0].version + 1]
      );
    } else {
      await db.execute(
        `INSERT INTO deliverable (project_id, team_id, title, file_path, file_type, version, uploaded_at, status)
         VALUES (?, ?, 'Source Code Repository', ?, 'url', 1, NOW(), 'PENDING')`,
        [projectId, teamId, repo_url]
      );
    }

    // Notify external supervisor
await notifyExternalSupervisor(
  projectId,
  teamId,
  `A team has submitted a new Source Code Repository URL for your project.`
);

    res.json({ message: "Repository URL submitted successfully" });
  } catch (err) {
    console.error("submitRepoUrl error:", err);
    res.status(500).json({ message: err.message || "Erreur serveur" });
  }
};

// ── POST /api/documents/deliverables/:id/feedback ─────────────────────────
exports.addFeedback = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    if (!["enseignant", "entreprise"].includes(user.role)) {
  return res.status(403).json({ message: "Accès refusé" });
}

const { id } = req.params; // ✅ declare FIRST

// External supervisors (entreprise) can only give feedback on Source Code Repository
if (user.role === "entreprise") {
  const [[deliverable]] = await db.execute(
    "SELECT title FROM deliverable WHERE id = ?",
    [id]
  );
  if (!deliverable) {
    return res.status(404).json({ message: "Livrable introuvable" });
  }
  if (deliverable.title !== "Source Code Repository") {
    return res.status(403).json({
      message: "External supervisors can only give feedback on the Source Code Repository",
    });
  }
}

  
    const { text, status } = req.body;

    if (!text)   return res.status(400).json({ message: "Feedback text manquant" });
    if (!status) return res.status(400).json({ message: "Status manquant (APPROVED | NEEDS_REVISION)" });

    await db.execute(
      `INSERT INTO deliverable_feedback (deliverable_id, supervisor_id, text, status)
       VALUES (?, ?, ?, ?)`,
      [id, user.id, text, status]
    );

    await db.execute(
      `UPDATE deliverable SET status = ? WHERE id = ?`,
      [status, id]
    );

    res.status(201).json({ message: "Feedback added successfully" });
  } catch (err) {
    console.error("addFeedback error:", err);
    res.status(500).json({ message: err.message || "Erreur serveur" });
  }
};

// ── GET /api/documents/deliverables/all ───────────────────────────────────
// Supervisor view — each team's deliverables isolated by team_id
exports.getAllDeliverables = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    if (!["enseignant", "entreprise", "admin", "super_admin"].includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // FIX: group by project_id AND team_id so each team's deliverables are separate
    const [rows] = await db.execute(
      `SELECT d.*, p.title AS project_title,
              CONCAT(u.first_name, ' ', u.last_name) AS student_name
       FROM deliverable d
       INNER JOIN (
         SELECT project_id, team_id, title, MAX(version) AS max_version
         FROM deliverable
         WHERE team_id IS NOT NULL
         GROUP BY project_id, team_id, title
       ) latest ON d.project_id = latest.project_id
              AND d.team_id     = latest.team_id
              AND d.title       = latest.title
              AND d.version     = latest.max_version
       LEFT JOIN project p ON d.project_id = p.id
       LEFT JOIN team_member tm ON tm.team_id = d.team_id AND tm.status = 'ACCEPTED'
       LEFT JOIN users u ON u.id = tm.student_id
       ORDER BY d.team_id, d.uploaded_at DESC`
    );

    const deliverables = await Promise.all(
      rows.map(async (d) => {
        const [feedbacks] = await db.execute(
          `SELECT df.id, df.text, df.created_at, df.status,
                  CONCAT(u.first_name, ' ', u.last_name) AS supervisor_name
           FROM deliverable_feedback df
           JOIN users u ON df.supervisor_id = u.id
           WHERE df.deliverable_id = ?
           ORDER BY df.created_at ASC`,
          [d.id]
        );
        return { ...d, feedbacks };
      })
    );

    res.json({ deliverables });
  } catch (err) {
    console.error("getAllDeliverables error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// GET /api/documents/deliverables/is-leader
exports.checkIsLeader = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ isLeader: false });

  try {
    const user   = await getUserFromToken(token);
    const teamId = await getStudentTeam(user.id);
    if (!teamId) return res.json({ isLeader: false });

    const [rows] = await db.execute(
      "SELECT leader_id FROM team WHERE id = ?",
      [teamId]
    );

    const isLeader = rows.length > 0 && rows[0].leader_id === user.id;
    res.json({ isLeader });
  } catch (err) {
    console.error("checkIsLeader error:", err);
    res.json({ isLeader: false });
  }
};