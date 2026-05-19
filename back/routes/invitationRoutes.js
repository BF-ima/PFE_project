const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/invitationController");

router.get("/",                    ctrl.getMyInvitations);
router.patch("/:memberId/accept",  ctrl.acceptInvitation);
router.patch("/:memberId/decline", ctrl.declineInvitation);

module.exports = router;