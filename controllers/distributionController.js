// controllers/distributionController.js
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const { createGroupConversations } = require("../services/groupService");

// ADD after line 4 (after the db require):
const sendNotification = async (userId, type, title, message) => {
  await db.execute(
    `INSERT INTO notification (user_id, type, title, message, is_read, created_at)
     VALUES (?, ?, ?, ?, 0, NOW())`,
    [userId, type, title, message]
  );
};

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

const getUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const [users] = await db.execute(
    "SELECT id, role FROM users WHERE id = ?",
    [decoded.id]
  );
  if (users.length === 0) throw new Error("Utilisateur non trouvé");
  return users[0];
};

const getTeamAverage = async (teamId) => {
  const [rows] = await db.execute(
    `SELECT s.moyenne
     FROM student s
     JOIN team_member tm ON tm.student_id = s.id
     WHERE tm.team_id = ?`,
    [teamId]
  );
  if (rows.length === 0) return 0;
  const sum = rows.reduce((acc, r) => acc + parseFloat(r.moyenne || 0), 0);
  return sum / rows.length;
};

const getRankedTeams = async (mode) => {
  const [teams] = await db.execute(
    `SELECT t.id AS team_id,
            MIN(w.submitted_at) AS first_submitted_at
     FROM team t
     JOIN wish w ON w.team_id = t.id
     WHERE w.status = 'SUBMITTED'
     GROUP BY t.id`
  );

  const enriched = await Promise.all(
    teams.map(async (team) => ({
      ...team,
      average: await getTeamAverage(team.team_id),
    }))
  );

  enriched.sort((a, b) => {
    if (mode === "date") {
      const dateDiff = new Date(a.first_submitted_at) - new Date(b.first_submitted_at);
      if (dateDiff !== 0) return dateDiff;
      return b.average - a.average;
    }
    if (b.average !== a.average) return b.average - a.average;
    return new Date(a.first_submitted_at) - new Date(b.first_submitted_at);
  });

  return enriched;
};

const getTeamWishes = async (teamId) => {
  const [wishes] = await db.execute(
    `SELECT w.project_id, w.priority
     FROM wish w
     WHERE w.team_id = ? AND w.status = 'SUBMITTED'
     ORDER BY w.priority ASC`,
    [teamId]
  );
  return wishes;
};

// -----------------------------------------------------------------------------
// CORE ALGORITHM
// -----------------------------------------------------------------------------
const simulateDistribution = async (mode) => {
  const rankedTeams = await getRankedTeams(mode);

  const [allProjects] = await db.execute(
    "SELECT id, max_students FROM project WHERE status = 'VALIDATED' OR status = 'ASSIGNED'"
  );
  const projectMap = {};
  for (const p of allProjects) {
  projectMap[p.id] = { max_students: p.max_students, assigned_teams: 0 };
}

  const getTeamSize = async (teamId) => {
    const [rows] = await db.execute(
      "SELECT COUNT(*) AS cnt FROM team_member WHERE team_id = ?",
      [teamId]
    );
    return rows[0].cnt;
  };

  const assignments = [];
  const unassigned  = [];

  for (const team of rankedTeams) {
    const wishes   = await getTeamWishes(team.team_id);
    let assigned   = false;

    for (const wish of wishes) {
  const proj = projectMap[wish.project_id];
  if (!proj) continue;
  if (proj.assigned_teams >= proj.max_students) continue; // max teams reached

  proj.assigned_teams += 1;

  assignments.push({
    team_id:            team.team_id,
    project_id:         wish.project_id,
    priority_obtained:  wish.priority,
    team_average:       team.average,
    first_submitted_at: team.first_submitted_at,
  });
  assigned = true;
  break;
}

    if (!assigned) {
      unassigned.push({
        team_id:            team.team_id,
        team_average:       team.average,
        first_submitted_at: team.first_submitted_at,
        reason: "Aucun projet disponible correspondant aux voeux et à la taille de l'équipe",
      });
    }
  }

  return { assignments, unassigned };
};

// -----------------------------------------------------------------------------
// PREVIEW  (dry-run — nothing written to DB)
// POST /api/distribution/preview
// Body: { mode: 'average' | 'date' | 'average_date' }
// -----------------------------------------------------------------------------
exports.previewDistribution = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    if (!["admin", "super_admin"].includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { mode = "average" } = req.body;
    if (!["average", "date", "average_date"].includes(mode)) {
      return res.status(400).json({ message: "Mode invalide" });
    }

    // Enrich preview with team leader names and project titles for the UI
    const { assignments, unassigned } = await simulateDistribution(mode);

    const enrichedAssignments = await Promise.all(
      assignments.map(async (a) => {
        const [[team]] = await db.execute(
          `SELECT CONCAT(u.first_name, ' ', u.last_name) AS leader_name, u.email AS leader_email
           FROM team t JOIN users u ON u.id = t.leader_id WHERE t.id = ?`,
          [a.team_id]
        );
        const [[project]] = await db.execute(
          "SELECT title, max_students FROM project WHERE id = ?",
          [a.project_id]
        );
        const [[size]] = await db.execute(
          "SELECT COUNT(*) AS cnt FROM team_member WHERE team_id = ?",
          [a.team_id]
        );
        return {
          ...a,
          leader_name:   team?.leader_name   || "",
          leader_email:  team?.leader_email  || "",
          project_title: project?.title      || "",
          max_students:  project?.max_students || 0,
          team_size:     size?.cnt           || 0,
        };
      })
    );

    const enrichedUnassigned = await Promise.all(
      unassigned.map(async (u) => {
        const [[team]] = await db.execute(
          `SELECT CONCAT(u2.first_name, ' ', u2.last_name) AS leader_name
           FROM team t JOIN users u2 ON u2.id = t.leader_id WHERE t.id = ?`,
          [u.team_id]
        );
        return { ...u, leader_name: team?.leader_name || "" };
      })
    );

    res.json({
      assignments:      enrichedAssignments,
      unassigned:       enrichedUnassigned,
      total_assigned:   enrichedAssignments.length,
      total_unassigned: enrichedUnassigned.length,
    });

  } catch (err) {
    console.error("previewDistribution error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// RUN  (writes to DB + auto-creates group conversations)
// POST /api/distribution/run
// Body: { mode: 'average' | 'date' | 'average_date' }
// -----------------------------------------------------------------------------
exports.runDistribution = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    if (!["admin", "super_admin"].includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { mode = "average" } = req.body;
    if (!["average", "date", "average_date"].includes(mode)) {
      return res.status(400).json({ message: "Mode invalide" });
    }

    const { assignments, unassigned } = await simulateDistribution(mode);

  // Clear ONLY assignment-table records, NOT direct team.project_id assignments
const [oldAssignments] = await db.execute("SELECT project_id FROM assignment");
for (const old of oldAssignments) {
  await db.execute(
    "UPDATE project SET status = 'VALIDATED' WHERE id = ?",
    [old.project_id]
  );
}
await db.execute("DELETE FROM assignment");

// ✅ Re-mark projects that are directly assigned via team.project_id
await db.execute(
  `UPDATE project SET status = 'ASSIGNED' 
   WHERE id IN (SELECT project_id FROM team WHERE project_id IS NOT NULL)`
);

    // Write new assignments
    for (const a of assignments) {
      await db.execute(
        `INSERT INTO assignment (team_id, project_id, assigned_at, mode)
         VALUES (?, ?, NOW(), ?)`,
        [a.team_id, a.project_id, mode]
      );

      await db.execute(
        "UPDATE project SET status = 'ASSIGNED' WHERE id = ?",
        [a.project_id]
      );

      // Fetch supervisor for this project
      const [[proj]] = await db.execute(
        "SELECT teacher_id, external_supervisor_id FROM project WHERE id = ?",
        [a.project_id]
      );

      // Auto-create the two group conversations for this team
      await createGroupConversations(a.team_id, proj?.teacher_id || null);
     // Fetch full project details for notification — safe (no destructuring crash)
      const [projectRows] = await db.execute(
        `SELECT p.title, p.teacher_id, p.external_supervisor_id
         FROM project p WHERE p.id = ?`,
        [a.project_id]
      );
      const projectData = projectRows[0] || null;

      // Fetch team leader
      const [leaderRows] = await db.execute(
        `SELECT CONCAT(u.first_name, ' ', u.last_name) AS full_name
         FROM team t JOIN users u ON u.id = t.leader_id
         WHERE t.id = ?`,
        [a.team_id]
      );
      const leaderData = leaderRows[0] || null;

      // Fetch team members
      const [membersData] = await db.execute(
        `SELECT CONCAT(u.first_name, ' ', u.last_name) AS full_name
         FROM team_member tm JOIN users u ON u.id = tm.student_id
         WHERE tm.team_id = ? AND tm.status = 'ACCEPTED'`,
        [a.team_id]
      );

      const memberNames  = membersData.map(m => m.full_name).join(", ") || "—";
      const leaderName   = leaderData?.full_name || "—";
      const supervisorId = projectData?.teacher_id || projectData?.external_supervisor_id;

      if (projectData && supervisorId) {
        const allocationMsg =
          `📋 Project: "${projectData.title}"\n` +
          `👥 Team #${a.team_id}\n` +
          `👑 Leader: ${leaderName}\n` +
          `🧑‍🤝‍🧑 Members: ${memberNames}`;

        await sendNotification(
          supervisorId,
          "info",
          "Allocation Result — Team Assigned",
          allocationMsg
        );
      }
    }   // ← closing brace of for (const a of assignments)

    res.json({
      message:          "Distribution effectuée et groupes de messagerie créés avec succès",
      assignments,
      unassigned,
      total_assigned:   assignments.length,
      total_unassigned: unassigned.length,
    });

  } catch (err) {
    console.error("runDistribution error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// GET DISTRIBUTION RESULTS
// GET /api/distribution/results
// -----------------------------------------------------------------------------
exports.getDistributionResults = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    if (!["admin", "super_admin", "enseignant"].includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    
const [results] = await db.execute(
  `SELECT a.id,
          a.assigned_at,
          a.mode,
          t.id                                       AS team_id,
          CONCAT(u.first_name, ' ', u.last_name)     AS leader_name,
          u.email                                    AS leader_email,
          p.id                                       AS project_id,
          p.title                                    AS project_title,
          p.max_students,
          p.speciality_id,                           -- ← AJOUT
          (SELECT COUNT(*) FROM team_member tm3 WHERE tm3.team_id = t.id) AS team_size,
          (SELECT AVG(s2.moyenne)
           FROM team_member tm2
           JOIN student s2 ON s2.id = tm2.student_id
           WHERE tm2.team_id = t.id)                AS team_average,
          (SELECT MIN(w2.submitted_at)
           FROM wish w2
           WHERE w2.team_id = t.id AND w2.status = 'SUBMITTED') AS first_submitted_at,
          (SELECT w3.priority
           FROM wish w3
           WHERE w3.team_id = t.id
             AND w3.project_id = p.id
             AND w3.status = 'SUBMITTED'
           LIMIT 1)                                 AS assigned_priority
   FROM assignment a
   JOIN team    t ON t.id = a.team_id
   JOIN users   u ON u.id = t.leader_id
   JOIN project p ON p.id = a.project_id
   ORDER BY a.assigned_at DESC`
);

    res.json({ results });

  } catch (err) {
    console.error("getDistributionResults error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// -----------------------------------------------------------------------------
// EXPORT RESULTS  GET /api/distribution/export
// Returns full data needed for the Excel export
// -----------------------------------------------------------------------------
exports.exportResults = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    if (!["admin", "super_admin"].includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const [rows] = await db.execute(
      `SELECT
         t.id                                         AS team_id,
         p.title                                      AS project_title,
         CONCAT(sup.first_name, ' ', sup.last_name)   AS supervisor,
         ROUND(AVG(s.moyenne), 2)                     AS team_average,
         GROUP_CONCAT(
           CONCAT(u.first_name, ' ', u.last_name)
           ORDER BY u.first_name
           SEPARATOR ', '
         )                                            AS members,
         (SELECT w.priority
          FROM wish w
          WHERE w.team_id = t.id AND w.project_id = p.id
            AND w.status = 'SUBMITTED'
          LIMIT 1)                                    AS assigned_priority
       FROM assignment a
       JOIN team        t   ON t.id  = a.team_id
       JOIN project     p   ON p.id  = a.project_id
       LEFT JOIN users  sup ON sup.id = p.teacher_id
       JOIN team_member tm  ON tm.team_id = t.id
       JOIN student     s   ON s.id  = tm.student_id
       JOIN users       u   ON u.id  = s.id
       GROUP BY t.id, p.title, supervisor, a.assigned_at
       ORDER BY t.id ASC`
    );

    res.json({ rows });

  } catch (err) {
    console.error("exportResults error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// GET UNASSIGNED TEAMS
// GET /api/distribution/unassigned
// -----------------------------------------------------------------------------
exports.getUnassignedTeams = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    if (!["admin", "super_admin"].includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const [teams] = await db.execute(
  `SELECT t.id AS team_id,
          CONCAT(u.first_name, ' ', u.last_name) AS leader_name,
          u.email AS leader_email,
          s.speciality_id,                        -- ← AJOUT
          (SELECT COUNT(*) FROM team_member tm WHERE tm.team_id = t.id) AS team_size,
          (SELECT AVG(st.moyenne) FROM team_member tm2
           JOIN student st ON st.id = tm2.student_id WHERE tm2.team_id = t.id) AS team_average
   FROM team t
   JOIN users u ON u.id = t.leader_id
   JOIN student s ON s.id = t.leader_id          -- ← AJOUT
   WHERE t.id NOT IN (SELECT team_id FROM assignment)
     AND t.id IN (SELECT DISTINCT team_id FROM wish WHERE status = 'SUBMITTED')`
);

    res.json({ teams });

  } catch (err) {
    console.error("getUnassignedTeams error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------------------------------------
// MANUAL ASSIGN  (admin overrides one team manually)
// POST /api/distribution/manual
// Body: { team_id, project_id }
// -----------------------------------------------------------------------------
exports.manualAssign = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    if (!["admin", "super_admin"].includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { team_id, project_id } = req.body;
    if (!team_id || !project_id) {
      return res.status(400).json({ message: "team_id et project_id sont requis" });
    }

    // Check project exists
    const [[proj]] = await db.execute(
      "SELECT id, max_students, status, teacher_id FROM project WHERE id = ?",
      [project_id]
    );
    if (!proj) return res.status(404).json({ message: "Projet introuvable" });
    if (!["VALIDATED", "ASSIGNED"].includes(proj.status)) {
      return res.status(400).json({ message: "Ce projet n'est pas disponible" });
    }

    // Check if this team already has an assignment (needed before capacity check)
    const [[oldAssignment]] = await db.execute(
      "SELECT project_id FROM assignment WHERE team_id = ?",
      [team_id]
    );

    // Check project capacity, excluding this team's current slot if it's already on this project
    const [[assignedCount]] = await db.execute(
      "SELECT COUNT(*) AS cnt FROM assignment WHERE project_id = ?",
      [project_id]
    );
    const effectiveCount = assignedCount.cnt - (oldAssignment?.project_id === project_id ? 1 : 0);
    if (effectiveCount >= proj.max_students) {
      return res.status(409).json({
        message: `Ce projet a atteint sa capacité maximale (${proj.max_students} équipes)`,
      });
    }

    // Remove existing assignment for this team if any
    if (oldAssignment) {
      await db.execute(
        "UPDATE project SET status = 'VALIDATED' WHERE id = ?",
        [oldAssignment.project_id]
      );
      await db.execute("DELETE FROM assignment WHERE team_id = ?", [team_id]);
    }

    // Insert new assignment
    await db.execute(
      "INSERT INTO assignment (team_id, project_id, assigned_at, mode) VALUES (?, ?, NOW(), 'manual')",
      [team_id, project_id]
    );
    await db.execute("UPDATE project SET status = 'ASSIGNED' WHERE id = ?", [project_id]);

    // Create group conversations
    await createGroupConversations(team_id, proj.teacher_id || null);

    res.json({ message: "Attribution manuelle effectuée avec succès" });

  } catch (err) {
    console.error("manualAssign error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


exports.getTeamsWithAverages = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    if (!["admin", "super_admin", "enseignant"].includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const [wishes] = await db.execute(
      `SELECT w.id, w.priority, w.submitted_at, w.status,
              t.id                                   AS team_id,
              CONCAT(u.first_name, ' ', u.last_name) AS leader_name,
              u.email                                AS leader_email,
              p.title                                AS project_title,
              p.id                                   AS project_id
       FROM wish w
       JOIN team    t ON t.id = w.team_id
       JOIN users   u ON u.id = t.leader_id
       JOIN project p ON p.id = w.project_id
       ORDER BY t.id ASC, w.priority ASC`
    );

    const averageCache = {};
    const enriched = await Promise.all(
      wishes.map(async (w) => {
        if (averageCache[w.team_id] === undefined) {
          averageCache[w.team_id] = await getTeamAverage(w.team_id);
        }
        return { ...w, team_average: averageCache[w.team_id] };
      })
    );

    res.json({ wishes: enriched });
  } catch (err) {
    console.error("getTeamsWithAverages error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


exports.getMyResult = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the team this student belongs to
    const [[student]] = await db.execute(
      "SELECT id FROM student WHERE id = ?", [decoded.id]
    );
    if (!student) return res.status(404).json({ message: "Étudiant non trouvé" });

    const [[teamMember]] = await db.execute(
      "SELECT team_id FROM team_member WHERE student_id = ?", [student.id]
    );
    if (!teamMember) return res.json({ assignment: null });

    // Get assignment for this team
    const [[assignment]] = await db.execute(`
      SELECT 
        a.assigned_at,
        p.title        AS project_title,
        p.description  AS project_description,
        p.id           AS project_id,
        (SELECT CONCAT(u.first_name, ' ', u.last_name) 
         FROM teacher t JOIN users u ON u.id = t.id 
         WHERE t.id = p.teacher_id LIMIT 1) AS supervisor,
        (SELECT w.priority FROM wish w 
         WHERE w.team_id = a.team_id 
           AND w.project_id = a.project_id 
           AND w.status = 'SUBMITTED' 
         LIMIT 1) AS assigned_priority
      FROM assignment a
      JOIN project p ON p.id = a.project_id
      WHERE a.team_id = ?
    `, [teamMember.team_id]);

    res.json({ assignment: assignment || null });

  } catch (err) {
    console.error("getMyResult error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getStatistics = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await getUserFromToken(token);
    if (!["admin", "super_admin"].includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // ── total_teams = ALL teams that exist (with or without wishes)
    const [[{ total_teams }]] = await db.execute(
      `SELECT COUNT(*) AS total_teams FROM team`
    );

    // ── assigned_teams = teams assigned via assignment table OR via team.project_id
    const [[{ assigned_teams }]] = await db.execute(
      `SELECT COUNT(*) AS assigned_teams FROM team
       WHERE id IN (SELECT team_id FROM assignment)
          OR project_id IS NOT NULL`
    );

    const unassigned_teams = total_teams - assigned_teams;
    const allocation_rate  = total_teams > 0
      ? Math.round((assigned_teams / total_teams) * 100) : 0;

    const [[{ first_choice }]] = await db.execute(
      `SELECT COUNT(*) AS first_choice FROM assignment a
       JOIN wish w ON w.team_id = a.team_id AND w.project_id = a.project_id
       WHERE w.priority = 1 AND w.status = 'SUBMITTED'`
    );
    const [[{ second_choice }]] = await db.execute(
      `SELECT COUNT(*) AS second_choice FROM assignment a
       JOIN wish w ON w.team_id = a.team_id AND w.project_id = a.project_id
       WHERE w.priority = 2 AND w.status = 'SUBMITTED'`
    );
    const [[{ third_choice_plus }]] = await db.execute(
      `SELECT COUNT(*) AS third_choice_plus FROM assignment a
       JOIN wish w ON w.team_id = a.team_id AND w.project_id = a.project_id
       WHERE w.priority >= 3 AND w.status = 'SUBMITTED'`
    );

    const satisfaction_rate = assigned_teams > 0
      ? Math.round((first_choice / assigned_teams) * 100) : 0;

    const [project_distribution] = await db.execute(
      `SELECT
         p.id             AS project_id,
         p.title          AS project_title,
         p.max_students,
         COUNT(a.team_id) AS assigned_teams
       FROM project p
       LEFT JOIN assignment a ON a.project_id = p.id
       WHERE p.status IN ('VALIDATED', 'ASSIGNED')
       GROUP BY p.id, p.title, p.max_students
       ORDER BY assigned_teams DESC`
    );

    res.json({
      total_teams,
      assigned_teams,
      unassigned_teams,
      allocation_rate,
      satisfaction_rate,
      first_choice,
      second_choice,
      third_choice_plus,
      project_distribution,
    });

  } catch (err) {
    console.error("getStatistics error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};