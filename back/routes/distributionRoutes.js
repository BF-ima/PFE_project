const express = require("express");
const router  = express.Router();
const ctrl             = require("../controllers/distributionController");
const publishController = require("../controllers/publishController");

router.post("/preview",   ctrl.previewDistribution);
router.post("/run",       ctrl.runDistribution);
router.get("/results",    ctrl.getDistributionResults);
router.get("/unassigned", ctrl.getUnassignedTeams);
router.post("/manual",    ctrl.manualAssign);
router.get("/teams",      ctrl.getTeamsWithAverages);
router.post("/publish",   publishController.publishResults);
router.get("/my-result", ctrl.getMyResult);
router.get("/statistics", ctrl.getStatistics);

module.exports = router;
