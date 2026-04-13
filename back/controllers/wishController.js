const db  = require("../config/db");
const jwt = require("jsonwebtoken");

// Helper — get user info from token
const getUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [users] = await db.execute(
    "SELECT id, role FROM users WHERE id = ?",
    [decoded.id]
  );
  if (users.length === 0) throw new Error("Utilisateur non trouvé");
  return users[0];
};

// Helper — get the team a student belongs to
const getStudentGroup = async (userId) => {
  const [rows] = await db.execute(
    `SELECT t.id AS group_id, t.leader_id
     FROM team t
     JOIN team_member tm ON tm.team_id = t.id
     WHERE tm.student_id = ?
     LIMIT 1`,
    [userId]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Helper — get all validated project IDs from DB
const getValidatedProjectIds = async () => {
  const [rows] = await db.execute(
    "SELECT id FROM project WHERE status = 'VALIDATED'"
  );
  return rows.map((r) => r.id);
};

// Helper — validate that the submitted order contains exactly all validated projects
const validateProjectOrder = (submittedIds, validatedIds) => {
  if (submittedIds.length !== validatedIds.length) return false;
  const validatedSet = new Set(validatedIds);
  const submittedSet = new Set(submittedIds);
  if (submittedSet.size !== submittedIds.length) return false; // duplicates
  for (const id of submittedIds) {
    if (!validatedSet.has(id)) return false;
  }
  return true;
};


// -----------------------------------------------------------------------------
// GET VALIDATED PROJECTS (available for wish ordering)
// -----------------------------------------------------------------------------
exports.getAvailableProjects = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);

    if (user.role !== "etudiant") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const [projects] = await db.execute(
      `SELECT p.id,
              p.title,
              p.description,
              p.max_students,
              p.created_at,
              CONCAT(t.first_name, ' ', t.last_name) AS supervisor,
              CONCAT(e.first_name, ' ', e.last_name) AS external_supervisor
       FROM project p
       LEFT JOIN users t ON p.teacher_id             = t.id
       LEFT JOIN users e ON p.external_supervisor_id = e.id
       WHERE p.status = 'VALIDATED'
       ORDER BY p.created_at DESC`
    );

    res.json({ projects });

  } catch (err) {
    console.error("getAvailableProjects error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// -----------------------------------------------------------------------------
// GET MY WISHES (load saved draft or submitted preferences)
// -----------------------------------------------------------------------------
exports.getMyWishes = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);

    const group = await getStudentGroup(user.id);
    if (!group) {
      return res.status(404).json({ message: "Vous n'appartenez à aucun groupe" });
    }

    const [wishes] = await db.execute(
      `SELECT w.id, w.project_id, w.priority, w.submitted_at, w.status,
              p.title,
              p.description,
              p.max_students,
              p.created_at  AS project_created_at,
              CONCAT(t.first_name, ' ', t.last_name) AS supervisor,
              CONCAT(e.first_name, ' ', e.last_name) AS external_supervisor
       FROM wish w
       JOIN project p ON p.id = w.project_id
       LEFT JOIN users t ON p.teacher_id             = t.id
       LEFT JOIN users e ON p.external_supervisor_id = e.id
       WHERE w.team_id = ?
       ORDER BY w.priority ASC`,
      [group.group_id]
    );

    res.json({
      wishes,
      isLeader: group.leader_id === user.id,
    });

  } catch (err) {
    console.error("getMyWishes error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// -----------------------------------------------------------------------------
// SAVE DRAFT
// Leader submits ALL validated projects in their preferred order.
// Priority is assigned automatically: 1 = most preferred, N = least preferred.
// Body: { projectIds: [3, 1, 5, 2, 4] }  <- ordered array of project IDs
// -----------------------------------------------------------------------------
exports.saveDraft = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    if (user.role !== "etudiant") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const group = await getStudentGroup(user.id);
    if (!group) {
      return res.status(404).json({ message: "Vous n'appartenez à aucun groupe" });
    }
    if (group.leader_id !== user.id) {
      return res.status(403).json({ message: "Seul le chef de groupe peut gérer les voeux" });
    }

    const [submitted] = await db.execute(
      "SELECT id FROM wish WHERE team_id = ? AND status = 'SUBMITTED' LIMIT 1",
      [group.group_id]
    );
    if (submitted.length > 0) {
      return res.status(400).json({ message: "Votre groupe a déjà soumis ses préférences définitivement" });
    }

    const { projectIds } = req.body;
    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ message: "La liste ordonnée des projets est requise" });
    }

    const validatedIds = await getValidatedProjectIds();
    if (!validateProjectOrder(projectIds, validatedIds)) {
      return res.status(400).json({
        message: "La liste doit contenir exactement tous les projets validés, sans doublons ni omissions",
      });
    }

    await db.execute(
      "DELETE FROM wish WHERE team_id = ? AND status = 'DRAFT'",
      [group.group_id]
    );

    for (let i = 0; i < projectIds.length; i++) {
      await db.execute(
        `INSERT INTO wish (team_id, project_id, priority, submitted_at, status)
         VALUES (?, ?, ?, NOW(), 'DRAFT')`,
        [group.group_id, projectIds[i], i + 1]
      );
    }

    res.json({ message: "Brouillon sauvegardé avec succès" });

  } catch (err) {
    console.error("saveDraft error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// -----------------------------------------------------------------------------
// SUBMIT PERMANENTLY
// Body: { projectIds: [3, 1, 5, 2, 4] }
// -----------------------------------------------------------------------------
exports.submitWishes = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);

    if (user.role !== "etudiant") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const group = await getStudentGroup(user.id);
    if (!group) {
      return res.status(404).json({ message: "Vous n'appartenez à aucun groupe" });
    }
    if (group.leader_id !== user.id) {
      return res.status(403).json({ message: "Seul le chef de groupe peut gérer les voeux" });
    }

    const [alreadySubmitted] = await db.execute(
      "SELECT id FROM wish WHERE team_id = ? AND status = 'SUBMITTED' LIMIT 1",
      [group.group_id]
    );
    if (alreadySubmitted.length > 0) {
      return res.status(409).json({ message: "Votre groupe a déjà soumis ses préférences définitivement" });
    }

    const { projectIds } = req.body;
    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ message: "La liste ordonnée des projets est requise" });
    }

    const validatedIds = await getValidatedProjectIds();
    if (!validateProjectOrder(projectIds, validatedIds)) {
      return res.status(400).json({
        message: "La liste doit contenir exactement tous les projets validés, sans doublons ni omissions",
      });
    }

    await db.execute(
      "DELETE FROM wish WHERE team_id = ? AND status = 'DRAFT'",
      [group.group_id]
    );

    for (let i = 0; i < projectIds.length; i++) {
      await db.execute(
        `INSERT INTO wish (team_id, project_id, priority, submitted_at, status)
         VALUES (?, ?, ?, NOW(), 'SUBMITTED')`,
        [group.group_id, projectIds[i], i + 1]
      );
    }

    res.json({ message: "Préférences soumises définitivement avec succès" });

  } catch (err) {
    console.error("submitWishes error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// -----------------------------------------------------------------------------
// GET ALL WISHES (admin/teacher view)
// -----------------------------------------------------------------------------
exports.getAllWishes = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);

    const allowedRoles = ["admin", "super_admin", "enseignant"];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const [wishes] = await db.execute(
      `SELECT w.id, w.priority, w.submitted_at, w.status,
              t.id                                     AS team_id,
              CONCAT(u.first_name, ' ', u.last_name)   AS leader_name,
              u.email                                  AS leader_email,
              p.title                                  AS project_title,
              p.id                                     AS project_id
       FROM wish w
       JOIN team    t ON t.id = w.team_id
       JOIN users   u ON u.id = t.leader_id
       JOIN project p ON p.id = w.project_id
       ORDER BY t.id ASC, w.priority ASC`
    );

    res.json({ wishes });

  } catch (err) {
    console.error("getAllWishes error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};