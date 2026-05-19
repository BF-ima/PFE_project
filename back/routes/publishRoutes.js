const express = require("express");
const router  = express.Router();
const publishController = require("../controllers/publishController");

// Distribution publish
router.post("/distribution/publish", publishController.publishResults);

// Notifications
router.get("/notifications",           publishController.getMyNotifications);
router.patch("/notifications/read-all", publishController.markAllAsRead);
router.patch("/notifications/:id/read", publishController.markAsRead);