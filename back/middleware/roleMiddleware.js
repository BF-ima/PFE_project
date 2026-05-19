// middleware/roleMiddleware.js

/**
 * Check if user has one of the allowed roles
 * @param {Array} allowedRoles - Array of allowed roles (e.g., ['super_admin', 'admin'])
 * @returns {Function} - Express middleware
 */
exports.checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user exists in request (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié - Utilisateur non trouvé" });
    }

    // Check if user's role is in the allowed roles array
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Accès refusé - Vous n'avez pas les permissions nécessaires",
        requiredRoles: allowedRoles,
        yourRole: req.user.role
      });
    }

    // User has required role, proceed
    next();
  };
};

/**
 * Check if user is super admin (convenience wrapper)
 */
exports.isSuperAdmin = () => {
  return exports.checkRole(['super_admin']);
};

/**
 * Check if user is admin or super admin
 */
exports.isAdmin = () => {
  return exports.checkRole(['super_admin', 'admin']);
};

/**
 * Check if user is teacher or higher
 */
exports.isTeacher = () => {
  return exports.checkRole(['super_admin', 'admin', 'enseignant']);
};

/**
 * Check if user is student or higher (most permissive)
 */
exports.isStudent = () => {
  return exports.checkRole(['super_admin', 'admin', 'enseignant', 'etudiant']);
};

/**
 * Check if user is company or higher
 */
exports.isCompany = () => {
  return exports.checkRole(['super_admin', 'admin', 'entreprise']);
};

/**
 * Check if user can access specific user data
 * This combines role check with ownership/permission check
 */
exports.canAccessUser = (req, res, next) => {
  // First check if authenticated
  if (!req.user) {
    return res.status(401).json({ message: "Non authentifié" });
  }

  const targetUserId = parseInt(req.params.id);
  const currentUserId = req.user.id;

  // Super admin can access anyone
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Users can access their own data
  if (targetUserId === currentUserId) {
    return next();
  }

  // Check if user has permission to access this specific user
  // You'll need to import your canAccessUser function from authController
  const authController = require('../controllers/authController');
  
  authController.canAccessUser(currentUserId, targetUserId)
    .then(hasAccess => {
      if (hasAccess) {
        next();
      } else {
        res.status(403).json({ 
          message: "Accès refusé - Vous ne pouvez pas accéder à cet utilisateur" 
        });
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur" });
    });
};