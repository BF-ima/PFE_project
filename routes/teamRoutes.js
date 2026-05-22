const express = require("express");
const router  = express.Router();
const {
  createTeam,
  assignProject,
  getAllTeams,
  getTeamById,
  getMyTeam,
  updateTeamStatus,
  deleteTeam,
  requestJoinTeam,
  acceptMember,
  removeMember,
  getTeamMembers,
  inviteMember,
  getSupervisorTeams,
} = require("../controllers/teamController");

// ── Team ───────────────────────────────────────────────────────────────────
router.get("/my",                    getMyTeam);           // GET    /teams/my
router.get("/my-supervisor-teams",   getSupervisorTeams);  // GET    /teams/my-supervisor-teams  ← moved up
router.get("/",                      getAllTeams);          // GET    /teams
router.get("/:id",                   getTeamById);         // GET    /teams/:id  ← must come after named routes
router.post("/",                     createTeam);          // POST   /teams
router.put("/:id/status",            updateTeamStatus);    // PUT    /teams/:id/status
router.put("/:id/project",           assignProject);       // PUT    /teams/:id/project
router.delete("/:id",                deleteTeam);          // DELETE /teams/:id

// ── Members ────────────────────────────────────────────────────────────────
router.get("/:id/members",                   getTeamMembers);
router.post("/:id/join",                     requestJoinTeam);
router.post("/:id/invite",                   inviteMember);
router.put("/:id/members/:memberId/accept",  acceptMember);
router.delete("/:id/members/:memberId",      removeMember);

module.exports = router;