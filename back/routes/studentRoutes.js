const express = require("express");

const {
    getMyProfile,
    updateMyProfile,
    getStudentById
} = require("../controllers/studentController");

const { authenticate } = require("../middleware/authMiddleware");

const { checkRole } = require("../middleware/roleMiddleware");

const router = express.Router();


/**
 GET MY PROFILE
*/
router.get(
    "/me",
    authenticate,
    checkRole(['etudiant']),
    getMyProfile
);


/**
 UPDATE MY PROFILE
*/
router.put(
    "/me",
    authenticate,
    checkRole(['etudiant']),
    updateMyProfile
);


/**
 GET STUDENT BY ID
*/
router.get(
    "/:id",
    authenticate,
    checkRole(['super_admin','admin','enseignant']),
    getStudentById
);


module.exports = router;