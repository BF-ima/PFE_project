const express    = require("express");
const router     = express.Router();
const multer     = require("multer");
const cloudinary = require("cloudinary").v2;
const ctrl       = require("../controllers/documentController");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout:    120000,
});

// Memory storage — stream to Cloudinary manually
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Helper: upload buffer to Cloudinary via stream
const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });

// Attach helper to req so controllers can use it
router.use((req, res, next) => {
  req.uploadToCloudinary = uploadToCloudinary;
  next();
});

// ── Documents (shared by supervisors) ─────────────────────────────────────
router.get("/",  ctrl.getDocuments);
router.post("/", upload.single("file"), ctrl.uploadDocument);

// ── Deliverables (submitted by students) ──────────────────────────────────
router.get("/deliverables/my",            ctrl.getMyDeliverables);
router.get("/deliverables/all",           ctrl.getAllDeliverables); 
router.get("/deliverables/is-leader", ctrl.checkIsLeader);  
router.post("/deliverables/upload",       upload.single("file"), ctrl.uploadDeliverable);
router.post("/deliverables/repo",         ctrl.submitRepoUrl);
router.post("/deliverables/:id/feedback", ctrl.addFeedback);             // supervisor feedback

module.exports = router;