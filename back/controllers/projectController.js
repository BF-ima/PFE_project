const db  = require("../config/db");
const jwt = require("jsonwebtoken");

// Helper — get supervisor info from token
const getSupervisorFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [users] = await db.execute(
    "SELECT id, role FROM users WHERE id = ?",
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
      return res.status(403).json({
        message: "Accès refusé. Seuls les superviseurs peuvent créer des projets",
      });
    }

    const { title, max_students, description, speciality_id, external_supervisor, assigned_student_email } = req.body;

    if (!title || !max_students) {
      return res.status(400).json({ message: "Titre et nombre max d'étudiants sont requis" });
    }

    const teacher_id = supervisor.role === "enseignant" ? supervisor.id : null;
    let external_supervisor_id = supervisor.role === "entreprise" ? supervisor.id : null;

    // If an external supervisor email was provided, look up their id
    if (supervisor.role === "enseignant" && external_supervisor) {
      const [extUsers] = await db.execute(
        "SELECT id, role FROM users WHERE email = ? AND role = 'entreprise'",
        [external_supervisor]
      );

      if (extUsers.length === 0) {
        return res.status(404).json({
          message: "Aucun superviseur externe trouvé avec cet email",
        });
      }

      external_supervisor_id = extUsers[0].id;
    }

    if (assigned_student_email) {
  const [[studentExists]] = await db.execute(
    "SELECT id FROM users WHERE email = ? AND role = 'etudiant'",
    [assigned_student_email]
  );
  if (!studentExists) {
    return res.status(404).json({
      message: `Aucun étudiant trouvé avec l'email : ${assigned_student_email}`,
    });
  }
}

    // Only allow assigned_student_email when there's an external supervisor
const studentEmail = external_supervisor_id ? (assigned_student_email || null) : null;

const [result] = await db.execute(
  `INSERT INTO project 
    (title, description, max_students, status, teacher_id, external_supervisor_id, speciality_id, assigned_student_email, created_at)
   VALUES (?, ?, ?, 'PENDING', ?, ?, ?, ?, NOW())`,
  [
    title,
    description || null,
    parseInt(max_students),
    teacher_id,
    external_supervisor_id,
    speciality_id || null,
    studentEmail,
  ]
);

    res.status(201).json({
      message:   "Projet créé avec succès",
      projectId: result.insertId,
    });

  } catch (err) {
    console.error("createProject error:", err);
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
               p.speciality_id, sp.name AS speciality_name,
               e.email AS external_supervisor_email,
               CONCAT(e.first_name, ' ', e.last_name) AS external_supervisor_name
        FROM project p
        LEFT JOIN speciality sp ON p.speciality_id = sp.id
        LEFT JOIN users e ON p.external_supervisor_id = e.id
        WHERE p.teacher_id = ?
        ORDER BY p.created_at DESC
      `;
    } else {
      query = `
        SELECT p.id, p.title, p.status, p.created_at, p.max_students, p.description,
               sp.name AS speciality_name
        FROM project p
        LEFT JOIN speciality sp ON p.speciality_id = sp.id
        WHERE p.external_supervisor_id = ?
        ORDER BY p.created_at DESC
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
              CONCAT(t.first_name, ' ', t.last_name) AS teacher_name,
              t.email                                  AS teacher_email,
              t.phone                                  AS teacher_phone,
              CONCAT(e.first_name, ' ', e.last_name) AS external_supervisor_name,
              e.email                                  AS external_supervisor_email,
              e.phone                                  AS external_supervisor_phone,
              s.name                                   AS speciality_name,
              s.code                                   AS speciality_code
       FROM project p
       LEFT JOIN users t  ON p.teacher_id             = t.id
       LEFT JOIN users e  ON p.external_supervisor_id = e.id
       LEFT JOIN speciality s ON p.speciality_id      = s.id
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
    const { title, max_students, description, speciality_id, external_supervisor, assigned_student_email } = req.body;

    if (!title || !max_students) {
      return res.status(400).json({ message: "Titre et nombre max d'étudiants sont requis" });
    }

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

    // Resolve external supervisor email → id if provided
    let external_supervisor_id = null;
    if (supervisor.role === "enseignant" && external_supervisor) {
      const [extUsers] = await db.execute(
        "SELECT id FROM users WHERE email = ? AND role = 'entreprise'",
        [external_supervisor]
      );

      if (extUsers.length === 0) {
        return res.status(404).json({
          message: "Aucun superviseur externe trouvé avec cet email",
        });
      }

      external_supervisor_id = extUsers[0].id;
    }

    const studentEmail = external_supervisor_id ? (assigned_student_email || null) : null;

await db.execute(
  `UPDATE project 
   SET title = ?, description = ?, max_students = ?, speciality_id = ?, external_supervisor_id = ?, assigned_student_email = ?
   WHERE id = ?`,
  [
    title,
    description || null,
    parseInt(max_students),
    speciality_id || null,
    external_supervisor_id,
    studentEmail,
    id,
  ]
);

    res.json({ message: "Projet modifié avec succès" });

  } catch (err) {
    console.error("updateProject error:", err);
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

    const { status } = req.query;
    const validStatuses = ["PENDING", "VALIDATED", "REJECTED", "ASSIGNED", "COMPLETED"];

    let query = `
      SELECT p.*,
             CONCAT(t.first_name, ' ', t.last_name) AS teacher_name,
             CONCAT(e.first_name, ' ', e.last_name) AS external_supervisor_name,
             e.email                                 AS external_supervisor_email,
             sp.name                                 AS speciality_name
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
    const { id }                      = req.params;
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

      // Single query — fetch everything we need upfront
      const [[projectRow]] = await db.execute(
        "SELECT assigned_student_email, teacher_id, external_supervisor_id FROM project WHERE id = ?",
        [id]
      );

      if (projectRow?.assigned_student_email) {

        const [[studentUser]] = await db.execute(
          "SELECT id FROM users WHERE email = ? AND role = 'etudiant'",
          [projectRow.assigned_student_email]
        );
        if (!studentUser) {
          return res.status(404).json({
            message: `Aucun étudiant trouvé avec l'email : ${projectRow.assigned_student_email}`,
          });
        }

        const [[teamMember]] = await db.execute(
          "SELECT team_id FROM team_member WHERE student_id = ?",
          [studentUser.id]
        );
        if (!teamMember) {
          return res.status(400).json({
            message: `L'étudiant (${projectRow.assigned_student_email}) n'appartient à aucun groupe`,
          });
        }

        const [[existingAssignment]] = await db.execute(
          "SELECT id FROM assignment WHERE team_id = ?",
          [teamMember.team_id]
        );
        if (existingAssignment) {
          return res.status(409).json({
            message: "Le groupe de cet étudiant a déjà un projet assigné",
          });
        }

        // Mark project ASSIGNED
        await db.execute(
          "UPDATE project SET status = 'ASSIGNED', approval_comment = ? WHERE id = ?",
          [comment || null, id]
        );

        // Create assignment row
        await db.execute(
          "INSERT INTO assignment (team_id, project_id, assigned_at, mode) VALUES (?, ?, NOW(), 'direct')",
          [teamMember.team_id, id]
        );

        // 1. Team-only conversation
        const [[existingTeamConv]] = await db.execute(
          "SELECT id FROM group_conversation WHERE team_id = ? AND group_type = 'team' LIMIT 1",
          [teamMember.team_id]
        );
        if (!existingTeamConv) {
          await db.execute(
            `INSERT INTO group_conversation (team_id, group_type, supervisor_id, created_at)
             VALUES (?, 'team', NULL, NOW())`,
            [teamMember.team_id]
          );
        }

        // 2. Team + internal teacher conversation
        if (projectRow.teacher_id) {
          const [[existingSupConv]] = await db.execute(
            `SELECT id FROM group_conversation
             WHERE team_id = ? AND group_type = 'team_supervisor' AND supervisor_id = ? LIMIT 1`,
            [teamMember.team_id, projectRow.teacher_id]
          );
          if (!existingSupConv) {
            await db.execute(
              `INSERT INTO group_conversation (team_id, group_type, supervisor_id, created_at)
               VALUES (?, 'team_supervisor', ?, NOW())`,
              [teamMember.team_id, projectRow.teacher_id]
            );
          }
        }

        // 3. Team + external supervisor conversation
        if (projectRow.external_supervisor_id) {
          const [[existingExtConv]] = await db.execute(
            `SELECT id FROM group_conversation
             WHERE team_id = ? AND group_type = 'team_supervisor' AND supervisor_id = ? LIMIT 1`,
            [teamMember.team_id, projectRow.external_supervisor_id]
          );
          if (!existingExtConv) {
            await db.execute(
              `INSERT INTO group_conversation (team_id, group_type, supervisor_id, created_at)
               VALUES (?, 'team_supervisor', ?, NOW())`,
              [teamMember.team_id, projectRow.external_supervisor_id]
            );
          }
        }

      } else {
        // Normal validation — project goes into the wish pool
        await db.execute(
          "UPDATE project SET status = ?, approval_comment = ? WHERE id = ?",
          [status, comment || null, id]
        );
      }

      // ── Notify external supervisor if one is assigned ──────────────────
const [[projectInfo]] = await db.execute(
  "SELECT external_supervisor_id, title FROM project WHERE id = ?",
  [id]
);
if (projectInfo?.external_supervisor_id) {
  await db.execute(
    `INSERT INTO notification (user_id, type, title, message, is_read, created_at)
     VALUES (?, 'INFO', 'Project Validated', ?, 0, NOW())`,
    [
      projectInfo.external_supervisor_id,
      `Your project "${projectInfo.title}" has been validated by the administration.`,
    ]
  );
}

    } else if (status === "REJECTED") {
      await db.execute(
        "UPDATE project SET status = ?, rejection_reason = ? WHERE id = ?",
        [status, reason || null, id]
      );
    } else {
      await db.execute("UPDATE project SET status = ? WHERE id = ?", [status, id]);
    }

    res.json({ message: "Statut mis à jour avec succès" });

  } catch (err) {
    console.error("updateProjectStatus error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// -----------------------------------------------------------------------------
// GET PROJECT MESSAGES
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

// -----------------------------------------------------------------------------
// GET VALIDATED PROJECTS
// -----------------------------------------------------------------------------
exports.getValidatedProjects = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const [projects] = await db.execute(
      `SELECT p.id, p.title, p.description, p.created_at, p.max_students,
              p.speciality_id,
              CONCAT(t.first_name, ' ', t.last_name) AS supervisor_name,
              CONCAT(e.first_name, ' ', e.last_name) AS external_supervisor_name,
              e.email                                  AS external_supervisor_email
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