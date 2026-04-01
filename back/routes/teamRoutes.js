/**
 * ==============================================================================
 * TEAM ROUTES  — /api/teams
 * ==============================================================================
 * All routes are protected: authentication is verified inside each controller
 * function, which also enforces the "etudiant" role restriction.
 *
 * Route summary:
 *   POST   /api/teams                              — create a team (leader)
 *   POST   /api/teams/:id/invite                   — invite a student (leader)
 *   DELETE /api/teams/:id/members/:studentId       — remove a member (leader)
 *   DELETE /api/teams/:id                          — delete the team (leader)
 *   PATCH  /api/teams/invitations/:invitationId    — accept/refuse invitation (invited student)
 *   GET    /api/teams/my                           — get my current team
 *   GET    /api/teams/invitations                  — list my pending invitations
 * ==============================================================================
 */

const express        = require("express");
const router         = express.Router();
const teamController = require("../controllers/teamController");
const authenticate   = require("../middleware/authMiddleware");
const { checkRole }  = require("../middleware/roleMiddleware");

// Every team route requires the caller to be an authenticated student
const studentOnly = [authenticate, checkRole(["etudiant"])];

// ── Leader actions ──────────────────────────────────────────────────────────
router.post  ("/",                             ...studentOnly, teamController.createTeam);
router.post  ("/:id/invite",                  ...studentOnly, teamController.inviteMember);
router.delete("/:id/members/:studentId",      ...studentOnly, teamController.removeMember);
router.delete("/:id",                         ...studentOnly, teamController.deleteTeam);

// ── Invited student actions ─────────────────────────────────────────────────
// NOTE: this route must be declared BEFORE /:id to avoid Express matching
// "invitations" as an :id parameter
router.get   ("/invitations",                 ...studentOnly, teamController.getMyInvitations);
router.patch ("/invitations/:invitationId",   ...studentOnly, teamController.respondToInvitation);

// ── Read actions ─────────────────────────────────────────────────────────────
router.get   ("/my",                          ...studentOnly, teamController.getMyTeam);

module.exports = router;