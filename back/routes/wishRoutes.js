const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/wishController");

router.get("/all",       ctrl.getAllWishes);
router.get("/available", ctrl.getAvailableProjects);
router.get("/my",        ctrl.getMyWishes);
router.post("/draft",    ctrl.saveDraft);
router.post("/submit",   ctrl.submitWishes);

module.exports = router;