const express           = require("express");
const router            = express.Router();
const projectController = require("../controllers/projectController");

router.post  ("/",           projectController.createProject);
router.get   ("/all",        projectController.getAllProjects);     
router.get   ("/my",         projectController.getMyProjects);      
router.get   ("/:id",        projectController.getProjectById);
router.put   ("/:id",        projectController.updateProject);
router.put   ("/:id/status", projectController.updateProjectStatus);
router.delete("/:id",        projectController.deleteProject);
router.get("/:id/messages", projectController.getProjectMessages);

module.exports = router;