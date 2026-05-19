/**
 * soutenanceRoutes.js
 *
 * Mount in your Express app (app.js / server.js):
 *   const soutenanceRoutes = require('./routes/soutenanceRoutes');
 *   app.use('/api', soutenanceRoutes);
 *
 * Requires:  npm install multer xlsx nodemailer
 */

const express = require("express");
const multer  = require("multer");
const router  = express.Router();

// ── Controllers ───────────────────────────────────────────────
const soutenanceCtrl = require("../controllers/soutenanceController");
const juryCtrl       = require("../controllers/juryController");
const gradeCtrl      = require("../controllers/gradeController");

// ── Multer – memory storage (no disk writes) ──────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel",                                           // .xls
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .xlsx / .xls files are accepted."));
    }
  },
});

// ═══════════════════════════════════════════════════════════════
//  DEFENSE REQUESTS   /api/soutenance/requests
// ═══════════════════════════════════════════════════════════════

// Supervisor submits a defense authorization request
router.post("/soutenance/requests", soutenanceCtrl.submitRequest);

// Get the defense request for a specific team (supervisor view)
router.get("/soutenance/requests/team/:teamId", soutenanceCtrl.getRequestByTeam);

// Super admin lists requests — query: ?status=PENDING|APPROVED|REJECTED
router.get("/soutenance/requests", soutenanceCtrl.getRequests);

// Super admin approves a request → auto-creates soutenance row → returns soutenanceId
router.patch("/soutenance/requests/:id/approve", soutenanceCtrl.approveRequest);

// Super admin rejects a request with optional comment
router.patch("/soutenance/requests/:id/reject", soutenanceCtrl.rejectRequest);

// ═══════════════════════════════════════════════════════════════
//  SOUTENANCE CRUD    /api/soutenance
// ═══════════════════════════════════════════════════════════════

// Manually create a soutenance (fallback — normally auto-created on approval)
router.post("/soutenance", soutenanceCtrl.createSoutenance);

// List all soutenances — query: ?status=SCHEDULED|COMPLETED  ?grade_status=PENDING|NOTED|PUBLISHED
router.get("/soutenance", soutenanceCtrl.getSoutenances);

// Get single soutenance with jury members + deliverables
router.get("/soutenance/:id", soutenanceCtrl.getSoutenanceById);

// Update date / time / room → re-notifies jury and team
router.put("/soutenance/:id", soutenanceCtrl.updateSoutenance);

// ═══════════════════════════════════════════════════════════════
//  JURY MANAGEMENT    /api/jury/:soutenanceId/members
// ═══════════════════════════════════════════════════════════════

// Add a jury member (PRESIDENT / RAPPORTEUR / EXAMINER)
router.post("/jury/:soutenanceId/members", juryCtrl.addJuryMember);

// List jury members ordered PRESIDENT → RAPPORTEUR → EXAMINER
router.get("/jury/:soutenanceId/members", juryCtrl.getJuryMembers);

// Update a jury member's details or role
router.patch("/jury/:soutenanceId/members/:memberId", juryCtrl.updateJuryMember);

// Remove a jury member
router.delete("/jury/:soutenanceId/members/:memberId", juryCtrl.removeJuryMember);

// Send HTML emails to jury + in-app notifications to team (requires date/time/room set)
router.post("/jury/:soutenanceId/notify", juryCtrl.notifyJury);

// ═══════════════════════════════════════════════════════════════
//  GRADES             /api/grades
// ═══════════════════════════════════════════════════════════════

// IMPORTANT: static routes (/template, /bulk-import) must come BEFORE /:soutenanceId

// Download pre-filled Excel grade template
router.get("/grades/template", gradeCtrl.downloadTemplate);

// Bulk import grades from Excel file (field name: "file")
router.post("/grades/bulk-import", upload.single("file"), gradeCtrl.bulkImportGrades);

// Get grades for a soutenance
router.get("/grades/:soutenanceId", gradeCtrl.getGrades);

// Enter / update grades for a soutenance (manual entry)
router.put("/grades/:soutenanceId", gradeCtrl.enterGrades);

// Publish grades for a single soutenance → notifies students
router.post("/grades/:soutenanceId/publish", gradeCtrl.publishGrades);

// Publish ALL soutenances in NOTED state at once
router.post("/publish-all", gradeCtrl.publishAllGrades);

module.exports = router;