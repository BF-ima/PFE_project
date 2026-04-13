const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/notificationController");

router.get("/",             ctrl.getNotifications);
router.patch("/read-all",   ctrl.markAllRead);
router.patch("/:id/read",   ctrl.markAsRead);
router.patch("/:id/unread", ctrl.markAsUnread);

module.exports = router;