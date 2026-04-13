// routes/distributionRoutes.js
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/distributionController");

router.post("/preview",       ctrl.previewDistribution);
router.post("/run",           ctrl.runDistribution);
router.get("/results",        ctrl.getDistributionResults);
router.get("/unassigned",     ctrl.getUnassignedTeams);
router.post("/manual",        ctrl.manualAssign);

module.exports = router;
