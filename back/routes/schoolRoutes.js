const express = require("express");
const router = express.Router();
const schoolController = require("../controllers/schoolController");

router.get("/specialities", schoolController.getSpecialities);
router.get("/promos", schoolController.getPromos);

module.exports = router;