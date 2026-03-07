const express = require("express");

const router = express.Router();

const {
getAllProjects,
searchProjects,
filterProjects,
getProjectDetails,
projectStatus,
saveProjectView
} = require("../controllers/projectController");

const {authenticate} = require("../middleware/authMiddleware");


router.get("/",authenticate,getAllProjects)

router.get("/search",authenticate,searchProjects)

router.get("/filter",authenticate,filterProjects)

router.get("/:id",authenticate,getProjectDetails)

router.get("/:id/status",authenticate,projectStatus)

router.post("/:id/view",authenticate,saveProjectView)

module.exports = router;