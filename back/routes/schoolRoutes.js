const express = require("express");
const router  = express.Router();
const schoolController = require("../controllers/schoolController");

router.get   ("/specialities/stats",    schoolController.getStats);
router.get   ("/specialities",          schoolController.getSpecialities);
router.post  ("/specialities",          schoolController.createSpeciality);   // ✅ ADD
router.put   ("/specialities/:id",      schoolController.updateSpeciality);   // ✅ ADD
router.delete("/specialities/:id",      schoolController.deleteSpeciality);   // ✅ ADD
router.get("/promos/active", schoolController.getActivePromos);  // specific FIRST
router.get("/promos",        schoolController.getPromos);        // general SECOND
router.post  ("/promos",          schoolController.createPromo);
router.put   ("/promos/:id",      schoolController.updatePromo);
router.patch ("/promos/:id/close",schoolController.closePromo);
router.patch("/promos/:id/open",  schoolController.openPromo);
module.exports = router;