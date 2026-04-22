const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/meetingController");

// Student
router.get("/my",                ctrl.getMyMeetings);

// Supervisor
router.get("/team/:teamId",      ctrl.getMeetingsByTeam);
router.post("/",                 ctrl.createMeeting);
router.put("/:id",               ctrl.updateMeeting);
router.patch("/:id/status",      ctrl.updateMeetingStatus);
router.delete("/:id",            ctrl.deleteMeeting);

module.exports = router;