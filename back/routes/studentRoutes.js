/**
 * ==============================================================================
 * STUDENT PROJECT ROUTES  — /api/student
 * ==============================================================================
 * All routes are protected and restricted to the "etudiant" role.
 *
 * Route summary:
 *   GET  /api/student/projects            — browse validated projects (search + filter)
 *   GET  /api/student/projects/:id        — get a single project's details
 *   GET  /api/student/supervisors         — list supervisors for filter dropdowns
 * ==============================================================================
 */

const express                  = require("express");
const router                   = express.Router();
const studentProjectController = require("../controllers/studentprojectController");
const authenticate             = require("../middleware/authMiddleware");
const { checkRole }            = require("../middleware/roleMiddleware");

const studentOnly = [authenticate, checkRole(["etudiant"])];

router.get("/projects",       ...studentOnly, studentProjectController.browseProjects);
router.get("/projects/:id",   ...studentOnly, studentProjectController.getProjectDetails);
router.get("/supervisors",    ...studentOnly, studentProjectController.getSupervisors);
// GET /api/users/by-email?email=...
router.get('/by-email', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email requis' });

  const [rows] = await db.execute(
    `SELECT u.id, u.first_name, u.last_name, u.email 
     FROM users u 
     INNER JOIN student s ON u.id = s.id
     WHERE u.email = ? AND u.role = 'etudiant' AND u.is_active = 1`,
    [email]
  );

  if (rows.length === 0) return res.status(404).json({ message: 'Student not found' });
  res.json({ user: rows[0] });
});

module.exports = router;