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
const XLSX = require("xlsx");


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
        const [existing] = await db.execute("SELECT id FROM user WHERE role = 'super_admin'");
        if (existing.length > 0) {
            return res.status(400).json({ message: "Un super admin existe déjà" });
        }
        
        const { email, password, first_name, last_name} = req.body;
        
        const full_name = `${first_name} ${last_name}`;
        
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
            // Insert into user table
            const [userResult] = await connection.execute(
                "INSERT INTO user (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, 'super_admin')",
                [first_name, last_name, email, hashedPassword]
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
            first_name,
            last_name, 
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
            speciality_id,
            promo_id,
            moyenne,
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
            "SELECT id FROM user WHERE email = ?", 
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
            // Insert into user table
            const [userResult] = await connection.execute(
                "INSERT INTO user (first_name, last_name, email, password, role, created_by) VALUES (?, ?, ?, ?, ?, ?)",
                [first_name, last_name, email, hashedPassword, role, currentUserId]
            );

            const userId = userResult.insertId;// Get the new user's ID

            // Insert into role-specific table based on role
            switch (role) {
                case 'admin':
                    // For regular admins, super admin can assign specific permissions
                    await connection.execute(
                        `INSERT INTO administrator 
                        (id) 
                        VALUES (?)`,
                        [userId]
                    );
                    break;

                case 'enseignant':
                    await connection.execute(
                        `INSERT INTO teacher 
                        (id, grade) 
                        VALUES (?, ?)`,
                        [userId, specialization]
                    );
                    break;

                case 'etudiant':
                    await connection.execute(
                        `INSERT INTO student 
                        (id, moyenne, status, graduation_date, speciality_id, promo_id) 
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [userId, moyenne, 'ACTIVE', null, speciality_id, promo_id]
                    );
                    break;

                case 'entreprise':
                    await connection.execute(
                        `INSERT INTO external_supervisor 
                        (id, organization, position, phone) 
                        VALUES (?, ?, ?, ?)`,
                        [userId, company_name, contact_person, phone]
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
// REGISTER - with exel file
// -----------------------------------------------------------------------------

exports.importUsersFromExcel = async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Non authentifié" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUserId = decoded.id;

        if (!(await isSuperAdmin(currentUserId))) {
            return res.status(403).json({ message: "Seul le super admin peut importer" });
        }

        const file = req.file;
        if (!file) return res.status(400).json({ message: "Aucun fichier fourni" });

        const role = req.body.role; // le rôle envoyé depuis le front
        if (!role) return res.status(400).json({ message: "Rôle manquant" });

        // Lire le fichier Excel depuis le buffer
        const workbook = XLSX.read(file.buffer, { type: "buffer" }); 
        const sheet = workbook.Sheets[workbook.SheetNames[0]]; 
        const rows = XLSX.utils.sheet_to_json(sheet);

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            for (const row of rows) {
                const hashedPassword = await bcrypt.hash(row.password, 12);

                // Insérer l'utilisateur
                const [userResult] = await connection.execute(
                    `INSERT INTO user 
                     (first_name, last_name, email, password, role, created_by) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [row.first_name, row.last_name, row.email, hashedPassword, role, currentUserId]
                );

                const userId = userResult.insertId;

                // Insérer dans la table spécifique selon le rôle venant du front
                switch (role.toLowerCase()) {
                    case "enseignant":
                        await connection.execute(
                            `INSERT INTO teacher (id, grade) VALUES (?, ?)`,
                            [userId, row.specialization]
                        );
                        break;

                    case "etudiant":
                        await connection.execute(
                            `INSERT INTO student 
                             (id, moyenne, status, graduation_date, speciality_id, promo_id) 
                             VALUES (?, ?, ?, ?, ?, ?)`,
                            [userId, row.moyenne, 'ACTIVE', null, row.speciality_id, row.promo_id]
                        );
                        break;

                    case "entreprise":
                        await connection.execute(
                            `INSERT INTO external_supervisor 
                             (id, organization, position, phone) 
                             VALUES (?, ?, ?, ?)`,
                            [userId, row.company_name, row.contact_person, row.phone]
                        );
                        break;

                    default:
                        console.warn(`Rôle inconnu fourni depuis le front : ${role}`);
                }
            }

            await connection.commit();
            res.json({ message: "Utilisateurs importés avec succès" });

        } catch (error) {
            await connection.rollback();
            console.error("Erreur transaction :", error);
            res.status(500).json({ message: "Erreur lors de l'import dans la base de données" });
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error("Erreur serveur :", err);
        res.status(500).json({ message: "Erreur serveur lors de l'import Excel" });
    }
};

// -----------------------------------------------------------------------------
// LOGIN
// -----------------------------------------------------------------------------
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // chercher l'utilisateur
        const [users] = await db.execute("SELECT * FROM user WHERE email = ?", [email]);
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
                const [adminData] = await db.execute("SELECT * FROM administrator WHERE id = ?", [user.id]);
                profile = adminData[0];
                break;
            case 'enseignant':
                const [ensData] = await db.execute("SELECT * FROM teacher WHERE id = ?", [user.id]);
                profile = ensData[0];
                break;
            case 'etudiant':
                const [etuData] = await db.execute("SELECT * FROM student WHERE id = ?", [user.id]);
                profile = etuData[0];
                break;
            case 'entreprise':
                const [entData] = await db.execute("SELECT * FROM external_supervisor WHERE id = ?", [user.id]);
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
        "SELECT created_by FROM user WHERE id = ?",
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
                       CONCAT(u.first_name, ' ', u.last_name) as display_name
                FROM user u
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
                   CONCAT(u.first_name, ' ', u.last_name) as display_name
            FROM user u
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