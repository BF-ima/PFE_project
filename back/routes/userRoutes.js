const express           = require("express");
const router            = express.Router();
const userController = require("../controllers/userController");


router.get("/search", userController.searchUserByEmail);
router.get("/check-email", userController.emailcheck);

module.exports = router;