// middleware/auth.js
const jwt = require("jsonwebtoken");
const db = require("../config/db");

/**
 * Middleware to authenticate user via JWT token in cookie
 * Sets req.user with user information
 */
exports.authenticate = async (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ 
            message: "Non authentifié - Token manquant" 
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get full user data from database
        const [users] = await db.execute(
            "SELECT id, email, role, created_by FROM users WHERE id = ?",
            [decoded.id]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ 
                message: "Utilisateur non trouvé" 
            });
        }

        // Attach user to request object
        req.user = {
            id: users[0].id,
            email: users[0].email,
            role: users[0].role,
            created_by: users[0].created_by
        };
        
        next();
    } catch (err) {
        return res.status(401).json({ 
            message: "Token invalide ou expiré" 
        });
    }
};