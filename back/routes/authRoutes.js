const express = require("express");
const { body, validationResult } = require("express-validator");
const { 
    createDefaultSuperAdmin,
    register, 
    login, 
    logout,
    assignPermissions,
    getMyUsers,
    canViewUser 
} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const { checkRole, isSuperAdmin, isAdmin, canAccessUser } = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");
const authController = require("../controllers/authController");


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
        body("first_name").notEmpty().withMessage("Prénom requis"),
        body("last_name").notEmpty().withMessage("Nom requis")
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

router.post("/logout", logout);

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
        body("first_name").notEmpty().withMessage("Prénom requis"),
        body("last_name").notEmpty().withMessage("Nom requis"),
        // Enseignant fields
        body("department").if(body("role").equals("enseignant")).notEmpty().withMessage("Département requis"),
        body("specialization").if(body("role").equals("enseignant")).optional(),
        // Etudiant fields
        body("student_id").if(body("role").equals("etudiant")).notEmpty().withMessage("ID étudiant requis"),
        body("classe").if(body("role").equals("etudiant")).notEmpty().withMessage("Classe requise"),
        body("speciality_id").if(body("role").equals("etudiant")).isInt().withMessage("Spécialité requise"),
        body("promo_id").if(body("role").equals("etudiant")).isInt().withMessage("Promo requise"),
        body("moyenne").if(body("role").equals("etudiant")).isFloat({ min: 0, max: 20 }).withMessage("Moyenne invalide"),
        // Entreprise fields
        body("company_name").if(body("role").equals("entreprise")).notEmpty().withMessage("Nom d'entreprise requis"),
        body("contact_person").if(body("role").equals("entreprise")).optional(),
        body("phone").if(body("role").equals("entreprise")).optional().isMobilePhone().withMessage("Téléphone invalide"),
        body("address").if(body("role").equals("entreprise")).optional()
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


router.post(
    "/import-users",
    upload.single("file"),
    [
        body("role").isIn(['admin', 'enseignant', 'etudiant', 'entreprise']).withMessage("Rôle invalide")
    ],
    validate,
    authController.importUsersFromExcel
);


module.exports = router;