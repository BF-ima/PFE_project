/**
 ==============================================================================
 * AUTHENTICATION CONTROLLER
 ==============================================================================
 * Handles user authentication, registration, permissions, and user management
 * With role-based access control (Super Admin, Admin, Enseignant, Etudiant, Entreprise)
 ==============================================================================
 */

const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


/**
 ==============================================================================
 * SECTION 1: HELPER FUNCTIONS
 ==============================================================================
 */

// création JWT
const generateToken = (user) => { 
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
}; // token containing the user's ID and role, signed with a secret from environment variables, and set to expire in 1 day.


// Middleware to check if user is super admin
const isSuperAdmin = async (userId) => {
    const [users] = await db.execute(
        "SELECT role FROM users WHERE id = ?", 
        [userId]
    );
    return users.length > 0 && users[0].role === 'super_admin';
};


/**
 ==============================================================================
 * SECTION 2: AUTHENTICATION FUNCTIONS
 ==============================================================================
 */

// -----------------------------------------------------------------------------
// INITIAL SETUP - Create default super admin (run once)
// -----------------------------------------------------------------------------
exports.createDefaultSuperAdmin = async (req, res) => {
    try {
        // Check if any super admin exists
        const [existing] = await db.execute("SELECT id FROM users WHERE role = 'super_admin'");
        if (existing.length > 0) {
            return res.status(400).json({ message: "Un super admin existe déjà" });
        }
        
        const { email, password, full_name } = req.body;
        
        // Default permissions for super admin
        const defaultPermissions = {
            can_create_admin: true,
            can_create_enseignant: true,
            can_create_etudiant: true,
            can_create_entreprise: true,
            can_delete_users: true,
            can_update_users: true,
            can_view_all: true,
            can_assign_permissions: true
        };

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Start transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Insert into users table
            const [userResult] = await connection.execute(
                "INSERT INTO users (email, password, role) VALUES (?, ?, 'super_admin')",
                [email, hashedPassword] // created_by is null for super admin
            );

            const userId = userResult.insertId;

            // Insert into super_admin table
            await connection.execute(
                "INSERT INTO super_admin (id, full_name, permissions) VALUES (?, ?, ?)",
                [userId, full_name, JSON.stringify(defaultPermissions)]
            );

            await connection.commit();
            
            res.status(201).json({ 
                message: "Super admin créé avec succès" 
            });
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            message: "Erreur serveur lors de la création du super admin" 
        });
    }
};

// -----------------------------------------------------------------------------
// REGISTER - Only super admin can create other users
// -----------------------------------------------------------------------------
exports.register = async (req, res) => {
    // Get the authenticated user (super admin) from the token
    const token = req.cookies.token;
   
    if (!token) { // If no token, user is not authenticated
        return res.status(401).json({ 
            message: "Non authentifié" 
        });
    }

    try {
        // Verify token and get current user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUserId = decoded.id;

        // Check if current user is super admin
        const isSuper = await isSuperAdmin(currentUserId);
        if (!isSuper) {
            return res.status(403).json({ 
                message: "Accès refusé. Seul le super admin peut créer des utilisateurs" 
            });
        }

        const { 
            full_name, 
            email, 
            password, 
            role, 
            permissions,
            // Additional fields based on role
            department,
            specialization,
            student_id,
            classe,
            company_name,
            contact_person,
            phone,
            address,
            registration_number
        } = req.body;

        // Validate role
        const allowedRoles = ['admin', 'enseignant', 'etudiant', 'entreprise'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ 
                message: "Rôle invalide" 
            });
        }

        // Check if email exists
        const [existing] = await db.execute(
            "SELECT id FROM users WHERE email = ?", 
            [email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ 
                message: "Email déjà utilisé" 
            });
        }

        // Get super admin's permissions to validate what they can create
        const [superAdminData] = await db.execute(
            "SELECT permissions FROM super_admin WHERE id = ?",
            [currentUserId]
        );

        const superAdminPermissions = superAdminData[0].permissions;

        // Check if super admin has permission to create this role
        const permissionMap = {
            'admin': 'can_create_admin',
            'enseignant': 'can_create_enseignant',
            'etudiant': 'can_create_etudiant',
            'entreprise': 'can_create_entreprise'
        };

        if (!superAdminPermissions[permissionMap[role]]) {
            return res.status(403).json({ 
                message: `Vous n'avez pas la permission de créer des ${role}s` 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Start transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Insert into users table
            const [userResult] = await connection.execute(
                "INSERT INTO users (email, password, role, created_by) VALUES (?, ?, ?, ?)",
                [email, hashedPassword, role, currentUserId]
            );

            const userId = userResult.insertId;// Get the new user's ID

            // Insert into role-specific table based on role
            switch (role) {
                case 'admin':
                    // For regular admins, super admin can assign specific permissions
                    await connection.execute(
                        `INSERT INTO admins 
                        (id, full_name, permissions, created_by) 
                        VALUES (?, ?, ?, ?)`,
                        [userId, full_name, JSON.stringify(permissions || {}), currentUserId]
                    );
                    break;

                case 'enseignant':
                    await connection.execute(
                        `INSERT INTO enseignants 
                        (id, full_name, department, specialization, created_by) 
                        VALUES (?, ?, ?, ?, ?)`,
                        [userId, full_name, department, specialization, currentUserId]
                    );
                    break;

                case 'etudiant':
                    await connection.execute(
                        `INSERT INTO etudiants 
                        (id, full_name, student_id, classe, created_by) 
                        VALUES (?, ?, ?, ?, ?)`,
                        [userId, full_name, student_id, classe,currentUserId]
                    );
                    break;

                case 'entreprise':
                    await connection.execute(
                        `INSERT INTO entreprises 
                        (id, company_name, contact_person, phone, address, registration_number, created_by) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [userId, company_name, contact_person, phone, address, registration_number, currentUserId]
                    );
                    break;
            }

            await connection.commit();
            
            res.status(201).json({ 
                message: `${role} créé avec succès par super admin` 
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            message: "Erreur serveur lors de la création" 
        });
    }
};

// -----------------------------------------------------------------------------
// LOGIN
// -----------------------------------------------------------------------------
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // chercher l'utilisateur
        const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) return res.status(400).json({ message: "Email invalide" });

        const user = users[0];

        // comparer mot de passe
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Mot de passe invalide" });

        // récupérer profil selon rôle
        // Login should fetch profile based on role

        
        let profile;
        switch(user.role) {
            case 'super_admin':
                const [superData] = await db.execute("SELECT * FROM super_admin WHERE id = ?", [user.id]);
                profile = superData[0];
                break;
            case 'admin':
                const [adminData] = await db.execute("SELECT * FROM admins WHERE id = ?", [user.id]);
                profile = adminData[0];
                break;
            case 'enseignant':
                const [ensData] = await db.execute("SELECT * FROM enseignants WHERE id = ?", [user.id]);
                profile = ensData[0];
                break;
            case 'etudiant':
                const [etuData] = await db.execute("SELECT * FROM etudiants WHERE id = ?", [user.id]);
                profile = etuData[0];
                break;
            case 'entreprise':
                const [entData] = await db.execute("SELECT * FROM entreprises WHERE id = ?", [user.id]);
                profile = entData[0];
                break;
        }

        // créer token JWT
        const token = generateToken(user);

        // envoyer token dans cookie sécurisé
        res.cookie("token", token, { 
            httpOnly: true, 
            sameSite: "Strict", 
            secure: true 
        }); 
        // httpOnly: true: Cookie cannot be accessed by JavaScript (prevents XSS attacks)  
        // sameSite: "Strict": Cookie only sent to same site (prevents CSRF attacks)
        // secure: true: Cookie only sent over HTTPS (prevents man-in-the-middle)
        
        res.json({ 
            message: "Connexion réussie", 
            role: user.role, 
            profile,
            token 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// -----------------------------------------------------------------------------
// LOGOUT
// -----------------------------------------------------------------------------
exports.logout = (req, res) => {
    res.clearCookie("token"); // "token": Name of cookie to clear
    res.json({ message: "Déconnexion réussie" });
};


/**
 ==============================================================================
 * SECTION 3: PERMISSION FUNCTIONS
 ==============================================================================
 */

// -----------------------------------------------------------------------------
// Check if user has permission to access another user
// -----------------------------------------------------------------------------
exports.canAccessUser = async (requesterId, targetId) => {// requesterId: ID of user making the request, targetId: ID of user being accessed
    // Super admin can access anyone
    if (await isSuperAdmin(requesterId)) {
        return true;
    }
    
    // Check if requester created this user
    const [target] = await db.execute(
        "SELECT created_by FROM users WHERE id = ?",
        [targetId]
    );
    
    if (target[0]?.created_by === requesterId) {
        return true; // You can access users you created
    }
    
    // Check permissions table
    const [perms] = await db.execute(
        "SELECT * FROM user_permissions WHERE user_id = ?",
        [requesterId]
    );
    
    if (perms.length === 0) return false;
    
    // Check if they can view all
    if (perms[0].can_view_all_users) {
        return true;
    }
    
    // Check allowed list
    const allowedIds = JSON.parse(perms[0].allowed_user_ids || '[]');
    if (allowedIds.includes(parseInt(targetId))) {
        return true;
    }
    
    // Check restrictions
    const restrictedIds = JSON.parse(perms[0].restricted_user_ids || '[]');
    if (restrictedIds.includes(parseInt(targetId))) {
        return false;
    }
    
    return false;
};

// -----------------------------------------------------------------------------
// Middleware to check if user can view another user
// -----------------------------------------------------------------------------
exports.canViewUser = async (req, res, next) => {
    try {
        const requesterId = req.userId; // from auth middleware
        const targetId = req.params.id;
        
        // Use canAccessUser function
        if (await exports.canAccessUser(requesterId, targetId)) {
            return next();
        }
        
        return res.status(403).json({ message: "Accès refusé" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// -----------------------------------------------------------------------------
// Assign permissions to a user (only super admin)
// -----------------------------------------------------------------------------
exports.assignPermissions = async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Non authentifié" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if super admin
        if (!await isSuperAdmin(decoded.id)) {
            return res.status(403).json({ message: "Accès refusé" });
        }

        const { userId, permissions } = req.body;

        // Insert or update permissions
        await db.execute(
            `INSERT INTO user_permissions 
            (user_id, can_create_users, can_create_admin, can_create_enseignant, 
             can_create_etudiant, can_create_entreprise, can_view_all_users,
             allowed_user_ids, restricted_user_ids)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            can_create_users = VALUES(can_create_users),
            can_create_admin = VALUES(can_create_admin),
            can_create_enseignant = VALUES(can_create_enseignant),
            can_create_etudiant = VALUES(can_create_etudiant),
            can_create_entreprise = VALUES(can_create_entreprise),
            can_view_all_users = VALUES(can_view_all_users),
            allowed_user_ids = VALUES(allowed_user_ids),
            restricted_user_ids = VALUES(restricted_user_ids)`,
            [
                userId,
                permissions.can_create_users || false,
                permissions.can_create_admin || false,
                permissions.can_create_enseignant || false,
                permissions.can_create_etudiant || false,
                permissions.can_create_entreprise || false,
                permissions.can_view_all_users || false,
                JSON.stringify(permissions.allowed_user_ids || []),
                JSON.stringify(permissions.restricted_user_ids || [])
            ]
        );

        res.json({ message: "Permissions assignées avec succès" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};




// -----------------------------------------------------------------------------
// Get all users this user can access
// -----------------------------------------------------------------------------
exports.getMyUsers = async (req, res) => {
    try {
        // 1️⃣ Get current user from token
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: "Non authentifié" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // 2️⃣ Super admin → see all users
        if (await isSuperAdmin(userId)) {
            const [users] = await db.execute(`
                SELECT u.id, u.email, u.role,
                       CASE 
                           WHEN u.role = 'admin' THEN a.full_name
                           WHEN u.role = 'enseignant' THEN e.full_name
                           WHEN u.role = 'etudiant' THEN et.full_name
                           WHEN u.role = 'entreprise' THEN ent.company_name
                       END as display_name
                FROM users u
                LEFT JOIN admins a ON u.id = a.id AND u.role = 'admin'
                LEFT JOIN enseignants e ON u.id = e.id AND u.role = 'enseignant'
                LEFT JOIN etudiants et ON u.id = et.id AND u.role = 'etudiant'
                LEFT JOIN entreprises ent ON u.id = ent.id AND u.role = 'entreprise'
            `);
            return res.json({ users });
        }

        // 3️⃣ Load user permissions (allowed_user_ids)
        const [permsData] = await db.execute(
            "SELECT * FROM user_permissions WHERE user_id = ?",
            [userId]
        );

        let allowedIds = [];
        if (permsData[0]?.allowed_user_ids) {
            try {
                allowedIds = JSON.parse(permsData[0].allowed_user_ids);
            } catch {
                allowedIds = [];
            }
        }

        // 4️⃣ Build query → only include allowed users
        let query = `
            SELECT u.id, u.email, u.role,
                   CASE 
                       WHEN u.role = 'admin' THEN a.full_name
                       WHEN u.role = 'enseignant' THEN e.full_name
                       WHEN u.role = 'etudiant' THEN et.full_name
                       WHEN u.role = 'entreprise' THEN ent.company_name
                   END as display_name
            FROM users u
            LEFT JOIN admins a ON u.id = a.id AND u.role = 'admin'
            LEFT JOIN enseignants e ON u.id = e.id AND u.role = 'enseignant'
            LEFT JOIN etudiants et ON u.id = et.id AND u.role = 'etudiant'
            LEFT JOIN entreprises ent ON u.id = ent.id AND u.role = 'entreprise'
            WHERE 1=1
        `;

        const params = [];

        if (allowedIds.length > 0) {
            query += ` AND u.id IN (${allowedIds.map(() => '?').join(',')})`;
            params.push(...allowedIds);
        } else {
            query += ` AND 0`; // no users visible
        }

        const [users] = await db.execute(query, params);
        res.json({ users });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

/**
 ==============================================================================
 * END OF CONTROLLER
 ==============================================================================
 */