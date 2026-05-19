const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/announcementController");

router.get("/",  ctrl.getAnnouncements);
router.post("/", ctrl.createAnnouncement);

module.exports = router;