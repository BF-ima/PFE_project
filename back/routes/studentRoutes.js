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
const studentProjectController = require("../controllers/studentProjectController");
const authenticate             = require("../middleware/authMiddleware");
const { checkRole }            = require("../middleware/roleMiddleware");

const studentOnly = [authenticate, checkRole(["etudiant"])];

router.get("/projects",       ...studentOnly, studentProjectController.browseProjects);
router.get("/projects/:id",   ...studentOnly, studentProjectController.getProjectDetails);
router.get("/supervisors",    ...studentOnly, studentProjectController.getSupervisors);

module.exports = router;