const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/deadlineController");

router.get   ("/", controller.getDeadline);
router.post  ("/", controller.setDeadline);
router.delete("/", controller.deleteDeadline);

module.exports = router;