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
} = require("../controllers/teamController");

// ── Team ───────────────────────────────────────────────────────────────────
router.get("/my",          getMyTeam);         // GET    /teams/my
router.get("/",            getAllTeams);        // GET    /teams?project_id=&status=
router.get("/:id",         getTeamById);       // GET    /teams/:id
router.post("/",           createTeam);        // POST   /teams
router.put("/:id/status",  updateTeamStatus);  // PUT    /teams/:id/status
router.put("/:id/project", assignProject);     // PUT    /teams/:id/project
router.delete("/:id",      deleteTeam);        // DELETE /teams/:id

// ── Members ────────────────────────────────────────────────────────────────
router.get("/:id/members",                   getTeamMembers);  // GET    /teams/:id/members?status=
router.post("/:id/join",                     requestJoinTeam); // POST   /teams/:id/join
router.post("/:id/invite",                   inviteMember);  // POST   /teams/:id/invite
router.put("/:id/members/:memberId/accept",  acceptMember);    // PUT    /teams/:id/members/:memberId/accept
router.delete("/:id/members/:memberId",      removeMember);    // DELETE /teams/:id/members/:memberId

module.exports = router;