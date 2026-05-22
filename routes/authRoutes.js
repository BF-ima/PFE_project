const express = require("express");
const { body, validationResult } = require("express-validator");
const { 
    createDefaultSuperAdmin,
    register, 
    importUsersFromExcel,
    archiveUser,
    updateUser,
    login, 
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    assignPermissions,
    getMyUsers,
    getMe,
    canViewUser 
} = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");
const upload = require('../middleware/upload');
const { checkRole, isSuperAdmin, isAdmin, canAccessUser } = require("../middleware/roleMiddleware");

const router = express.Router();

// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// ==================== PUBLIC ROUTES ====================

router.post(
    "/createDefaultSuperAdmin",
    [
        body("email").isEmail().withMessage("Email invalide"),
        body("password").isLength({ min: 6 }).withMessage("Mot de passe doit contenir au moins 6 caractères"),
        body("full_name").notEmpty().withMessage("Nom complet requis")
    ],
    validate,
    createDefaultSuperAdmin
);

router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Email invalide"),
        body("password").notEmpty().withMessage("Mot de passe requis")
    ],
    validate,
    login
);



router.post('/import', upload.single('file'), importUsersFromExcel);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/change-password", changePassword);
router.delete('/delete/:id', archiveUser);
router.put('/update/:id', updateUser);
router.get("/me", getMe);

// ==================== PROTECTED ROUTES ====================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Super Admin only
 */
router.post(
    "/register",
    authenticate,
    isSuperAdmin(), // Using the role middleware
    [
        body("email").isEmail().withMessage("Email invalide"),
        body("password").isLength({ min: 6 }).withMessage("Mot de passe doit contenir au moins 6 caractères"),
        body("role").isIn(['admin', 'enseignant', 'etudiant', 'entreprise']).withMessage("Rôle invalide"),
        body("full_name").notEmpty().withMessage("Nom complet requis"),
        body('department').if(body('role').equals('entreprise')).notEmpty().withMessage('Département requis'),
        body("company_name").if(body("role").equals("entreprise")).notEmpty().withMessage("Nom d'entreprise requis")
    ],
    validate,
    register
);

/**
 * @route   GET /api/auth/my-users
 * @desc    Get all users this user can access
 * @access  Authenticated users (with permission checks)
 */
router.get(
    "/my-users",
    authenticate,
    checkRole(['super_admin', 'admin', 'enseignant', 'etudiant', 'entreprise']), // Any authenticated user
    getMyUsers
);

/**
 * @route   POST /api/auth/assignPermissions
 * @desc    Assign permissions to a user
 * @access  Super Admin only
 */
router.post(
    "/assignPermissions",
    authenticate,
    isSuperAdmin(),
    [
        body("userId").isInt().withMessage("ID utilisateur requis"),
        body("permissions").isObject().withMessage("Permissions requises")
    ],
    validate,
    assignPermissions
);

/**
 * @route   GET /api/auth/users/:id
 * @desc    Get a specific user with permission check
 * @access  Authenticated + Permission check
 */
router.get(
    "/users/:id",
    authenticate,
    canAccessUser, // Custom middleware that checks if user can access this specific user
    (req, res) => {
        // This will only execute if canAccessUser passes
        res.json({ 
            message: "Accès autorisé", 
            userId: req.params.id,
            user: req.user 
        });
    }
);

/**
 * @route   GET /api/auth/admin-only
 * @desc    Example route for admins only
 * @access  Admin or Super Admin
 */
router.get(
    "/admin-only",
    authenticate,
    isAdmin(),
    (req, res) => {
        res.json({ 
            message: "Bienvenue admin!",
            user: req.user 
        });
    }
);

/**
 * @route   GET /api/auth/teacher-only
 * @desc    Example route for teachers and above
 * @access  Teacher, Admin, or Super Admin
 */
router.get(
    "/teacher-only",
    authenticate,
    checkRole(['super_admin', 'admin', 'enseignant']),
    (req, res) => {
        res.json({ 
            message: "Bienvenue enseignant!",
            user: req.user 
        });
    }
);

module.exports = router;