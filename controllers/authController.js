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
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 ==============================================================================
 * SECTION 1: HELPER FUNCTIONS
 ==============================================================================
 */

// création JWT
const generateToken = (user) => { 
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

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
        const [existing] = await db.execute("SELECT id FROM users WHERE role = 'super_admin'");
        if (existing.length > 0) {
            return res.status(400).json({ message: "Un super admin existe déjà" });
        }
        
        const { email, password, first_name, last_name } = req.body;
        const full_name = `${first_name} ${last_name}`;

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

        const hashedPassword = await bcrypt.hash(password, 12);

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [userResult] = await connection.execute(
                "INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, 'super_admin')",
                [first_name, last_name, email, hashedPassword]
            );

            const userId = userResult.insertId;

            await connection.execute(
                "INSERT INTO super_admin (id, full_name, permissions) VALUES (?, ?, ?)",
                [userId, full_name, JSON.stringify(defaultPermissions)]
            );

            await connection.commit();
            
            res.status(201).json({ message: "Super admin créé avec succès" });
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur lors de la création du super admin" });
    }
};

// -----------------------------------------------------------------------------
// REGISTER - Only super admin can create other users
// -----------------------------------------------------------------------------
exports.register = async (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Non authentifié" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUserId = decoded.id;

        if (!(await isSuperAdmin(currentUserId))) {
            return res.status(403).json({ message: "Accès refusé. Seul le super admin peut créer des utilisateurs" });
        }
          
        console.log("REGISTER BODY:", req.body);
        const { first_name, last_name, email, password, role, permissions, specialization,rank, moyenne, speciality_id, promo_id, company_name, contact_person, phone, department } = req.body;

        const allowedRoles = ['admin', 'enseignant', 'etudiant', 'entreprise'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: "Rôle invalide" });
        }

        const [existing] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        const [superAdminData] = await db.execute("SELECT permissions FROM super_admin WHERE id = ?", [currentUserId]);
        const superAdminPermissions = superAdminData[0].permissions;

        const permissionMap = {
            'admin': 'can_create_admin',
            'enseignant': 'can_create_enseignant',
            'etudiant': 'can_create_etudiant',
            'entreprise': 'can_create_entreprise'
        };

        if (!superAdminPermissions[permissionMap[role]]) {
            return res.status(403).json({ message: `Vous n'avez pas la permission de créer des ${role}s` });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
          const [userResult] = await connection.execute(
             "INSERT INTO users (first_name, last_name, email, password, role, phone, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
              [first_name, last_name, email, hashedPassword, role, phone || null, currentUserId]
          );

            const userId = userResult.insertId;

            switch (role) {
                case 'admin':
                    await connection.execute("INSERT INTO administrator (id, permissions) VALUES (?,?)", [userId , JSON.stringify(permissions)]);
                    break;
                case 'enseignant':
                    await connection.execute("INSERT INTO teacher (id, grade , `rank`) VALUES (?, ? ,?)", [userId, specialization , rank]);
                    break;
                case 'etudiant':
                    // Verify speciality_id exists before inserting
                    const [specialityCheck] = await connection.execute(
                    "SELECT id FROM speciality WHERE id = ?", [speciality_id]
                    );
                   if (speciality_id && specialityCheck.length === 0) {
                   await connection.rollback();
                   connection.release();
                   return res.status(400).json({ message: "Speciality ID invalide — cette spécialité n'existe pas" });
                   }

                   await connection.execute(
                  "INSERT INTO student (id, moyenne, status, graduation_date, speciality_id, promo_id) VALUES (?, ?, ?, ?, ?, ?)",
                   [userId, moyenne || null, 'ACTIVE', null, speciality_id || null, promo_id || null]
                  );
                    break;
                case 'entreprise':
                   await connection.execute(
                  "INSERT INTO external_supervisor (id, organization, position, department) VALUES (?, ?, ?, ?)",
                   [userId, company_name, contact_person, department || null]
                  );
                break;
            }

            await connection.commit();
            res.status(201).json({ message: `${role} créé avec succès par super admin` });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur lors de la création" });
    }
};

// -----------------------------------------------------------------------------
// REGISTER - with Excel file
// -----------------------------------------------------------------------------
exports.importUsersFromExcel = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUserId = decoded.id;

    if (!(await isSuperAdmin(currentUserId))) {
      return res.status(403).json({ message: "Seul le super admin peut importer" });
    }

    const file = req.file;
    if (!file) return res.status(400).json({ message: "Aucun fichier fourni" });

    const role = req.body.role;
    if (!role) return res.status(400).json({ message: "Rôle manquant" });

    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    // Normalize row keys from Excel headers
    const normalizeRow = (row) => {
      const n = {};
      Object.keys(row).forEach((k) => {
        const key = k.toLowerCase().trim()
          .replace(/\s+/g, "").replace(/[-_]/g, "").replace(/[^a-z0-9]/g, "");
        n[key] = row[k]?.toString().trim() || "";
      });
      return {
        first_name:     n.firstname    || n.fname       || n.first        || "",
        last_name:      n.lastname     || n.lname       || n.last         || "",
        email:          n.email        || n.mail        || "",
        password:       n.password     || n.pass        || n.pwd          || "",
        phone:          n.phonenumber  || n.phone       || n.tel          || null,
        permission:     n.permission   || n.role        || n.permissiongiven || null,
        specialization: n.specialization || n.speciality || n.grade       || null,
        rank:           n.rank         || n.rank        || n.rank         || null,
        company_name:   n.companyname  || n.company     || n.organization || null,
        contact_person: n.contactperson|| n.contact     || n.position     || null,
        department:     n.department   || n.dept        || null,
        moyenne:        n.annualaverage|| n.average     || n.avg          || n.moyenne || null,
        speciality_id:  n.specialityid || n.speciality  || null,
        promo_id:       n.promoid      || n.promo       || null,
      };
    };

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      for (const rawRow of rows) {
        const row = normalizeRow(rawRow);

        if (!row.first_name || !row.last_name || !row.email || !row.password) {
          throw new Error(`Données manquantes dans une ligne: ${JSON.stringify(rawRow)}`);
        }

        const hashedPassword = await bcrypt.hash(row.password, 12);

        const [userResult] = await connection.execute(
          "INSERT INTO users (first_name, last_name, email, password, role, phone, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [row.first_name, row.last_name, row.email, hashedPassword, role, row.phone || null, currentUserId]
        );

        const userId = userResult.insertId;

        switch (role.toLowerCase()) {
          case "admin":
            const permissions = row.permission ? { [row.permission]: true } : {};
            await connection.execute(
              "INSERT INTO administrator (id, permissions) VALUES (?, ?)",
              [userId, JSON.stringify(permissions)]
            );
            break;

          case "enseignant":
            await connection.execute(
              "INSERT INTO teacher (id, grade , `rank`) VALUES (?, ? ,?)",
              [userId, row.specialization || null , row.rank]
            );
            break;

          case "etudiant":
            await connection.execute(
              "INSERT INTO student (id, moyenne, status, graduation_date, speciality_id, promo_id) VALUES (?, ?, ?, ?, ?, ?)",
              [userId, row.moyenne || null, "ACTIVE", null, row.speciality_id || null, row.promo_id || null]
            );
            break;

          case "entreprise":
            await connection.execute(
              "INSERT INTO external_supervisor (id, organization, position, department) VALUES (?, ?, ?, ?)",
              [userId, row.company_name || null, row.contact_person || null, row.department || null]
            );
            break;

          default:
            console.warn(`Rôle inconnu: ${role}`);
        }
      }

      await connection.commit();
      res.json({ message: "Utilisateurs importés avec succès", count: rows.length });

    } catch (error) {
      await connection.rollback();
      console.error("Erreur transaction:", error);
      res.status(500).json({ message: error.message || "Erreur lors de l'import" });
    } finally {
      connection.release();
    }

  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ message: "Erreur serveur lors de l'import Excel" });
  }
};




//--------------------------------------------------------------------
//archive user
//-------------------------------------------------------------------
// archive user by ID — only super admin can delete
exports.archiveUser = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUserId = decoded.id;

    if (!(await isSuperAdmin(currentUserId))) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const { id } = req.params;

    const [existing] = await db.execute(
      "SELECT id, first_name, last_name, email, role, phone FROM users WHERE id = ? AND created_by = ?",
      [id, currentUserId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const user = existing[0];
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1 — Copy to archived_users
      await connection.execute(
        `INSERT INTO archived_users (id, first_name, last_name, email, role, phone, archived_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user.id, user.first_name, user.last_name, user.email, user.role, user.phone, currentUserId]
      );

      // 2 — Set is_active to 0
      await connection.execute(
        "UPDATE users SET is_active = 0 WHERE id = ?",
        [id]
      );

      await connection.commit();
      res.status(200).json({ message: "Utilisateur archivé avec succès" });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de l'archivage" });
  }
};


//-----------------------------------------------------------------------------
//modify
//-----------------------------------------------------------------------------
exports.updateUser = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUserId = decoded.id;

    if (!(await isSuperAdmin(currentUserId))) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const { id } = req.params;

    const [existing] = await db.execute(
      "SELECT id, role FROM users WHERE id = ? AND created_by = ?",
      [id, currentUserId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const role = existing[0].role;

    const {
      first_name,
      last_name,
      email,
      phone,
      department,
      is_active,
      specialization,
      rank,
      moyenne,
      speciality_id,
      promo_id,
      company_name,
      contact_person,
    } = req.body;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      await connection.execute(
       `UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, is_active = ? WHERE id = ?`,
        [first_name, last_name, email, phone || null, is_active ?? 1, id]
      );

      // ── phone lives in the role-specific tables ──
      switch (role) {
        case 'enseignant':
          await connection.execute(
            "UPDATE teacher SET grade = ?, `rank` = ? WHERE id = ?",
            [specialization || null, rank , id]
          );
          break;

        case 'etudiant':
  await connection.execute(
    `UPDATE student SET 
      moyenne = ?,
      speciality_id = IF(? IS NOT NULL, ?, speciality_id),
      promo_id      = IF(? IS NOT NULL, ?, promo_id)
     WHERE id = ?`,
    [
      moyenne || null,
      speciality_id || null, speciality_id || null,
      promo_id || null,      promo_id || null,
      id
    ]
  );
  break;
        case 'entreprise':
    await connection.execute(
        "UPDATE external_supervisor SET organization = ?, position = ?, department = ? WHERE id = ?",
        [company_name || null, contact_person || null, department || null, id]
    );
    break;

        case 'admin':
          // nothing extra
          break;
      }

      await connection.commit();
      res.status(200).json({ message: "Utilisateur modifié avec succès" });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la modification" });
  }
};



// -----------------------------------------------------------------------------
// LOGIN
// -----------------------------------------------------------------------------
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) return res.status(400).json({ message: "Email invalide" });

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Mot de passe invalide" });

        let profile;
        switch(user.role) {
            case 'super_admin':
                [profile] = await db.execute("SELECT * FROM super_admin WHERE id = ?", [user.id]);
                profile = profile[0];
                break;
            case 'administrator':
                [profile] = await db.execute("SELECT * FROM administrator WHERE id = ?", [user.id]);
                profile = profile[0];
                break;
            case 'teacher':
                [profile] = await db.execute("SELECT * FROM teacher WHERE id = ?", [user.id]);
                profile = profile[0];
                break;
            case 'student':
                [profile] = await db.execute("SELECT * FROM student WHERE id = ?", [user.id]);
                profile = profile[0];
                break;
            case 'enterprise':
                [profile] = await db.execute("SELECT * FROM external_supervisor WHERE id = ?", [user.id]);
                profile = profile[0];
                break;
        }

        const token = generateToken(user);
        res.cookie("token", token, { httpOnly: true, sameSite: "Strict", secure: true });
        res.status(200).json({ message: "Connexion réussie", role: user.role, profile, token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// -----------------------------------------------------------------------------
// LOGOUT
// -----------------------------------------------------------------------------
exports.logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Déconnexion réussie" });
};

// -----------------------------------------------------------------------------
// FORGOT PASSWORD
// -----------------------------------------------------------------------------
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) return res.status(404).json({ message: "User not found" });

        const user = users[0];
        const token = crypto.randomBytes(32).toString("hex");
        const expire = new Date(Date.now() + 3600000); // 1 hour

        await db.execute(
            "UPDATE users SET reset_token = ?, reset_token_expire = ? WHERE id = ?",
            [token, expire, user.id]
        );

        const resetLink = `http://localhost:5173/resetpss/${token}`;

        const transporter = nodemailer.createTransport({
            secure: true,
            host: "smtp.gmail.com",
            port: 465,
            auth: {
                user: process.env.RESET_PSS_EMAIL,
                pass: process.env.EMAIL_CODE
            }
        });

        transporter.sendMail({
            to: email,
            subject: 'Password Reset',
            html: `<h3>Password Reset</h3><p>Click the link to reset your password:</p><a href="${resetLink}">click here</a>`
        });

        res.json({ message: "Reset link sent to email" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// -----------------------------------------------------------------------------
// RESET PASSWORD
// -----------------------------------------------------------------------------
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!token || !password || !confirmPassword)
            return res.status(400).json({ message: "All fields are required" });

        if (password !== confirmPassword)
            return res.status(400).json({ message: "Passwords do not match" });

        const [users] = await db.execute(
            "SELECT * FROM users WHERE reset_token = ? AND reset_token_expire > NOW()",
            [token]
        );

        if (users.length === 0)
            return res.status(400).json({ message: "Invalid or expired token" });

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            "UPDATE users SET password = ?, reset_token = NULL, reset_token_expire = NULL WHERE id = ?",
            [hashedPassword, users[0].id]
        );

        res.json({ message: "Password reset successful" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 ==============================================================================
 * SECTION 3: PERMISSION FUNCTIONS
 ==============================================================================
 */

// -----------------------------------------------------------------------------
// Check if user has permission to access another user
// -----------------------------------------------------------------------------
exports.canAccessUser = async (requesterId, targetId) => {
    if (await isSuperAdmin(requesterId)) return true;

    const [target] = await db.execute("SELECT created_by FROM users WHERE id = ?", [targetId]);
    if (target[0]?.created_by === requesterId) return true;

    const [perms] = await db.execute("SELECT * FROM user_permissions WHERE user_id = ?", [requesterId]);
    if (perms.length === 0) return false;

    if (perms[0].can_view_all_users) return true;

    const allowedIds = JSON.parse(perms[0].allowed_user_ids || '[]');
    if (allowedIds.includes(parseInt(targetId))) return true;

    const restrictedIds = JSON.parse(perms[0].restricted_user_ids || '[]');
    if (restrictedIds.includes(parseInt(targetId))) return false;

    return false;
};

// -----------------------------------------------------------------------------
// Middleware to check if user can view another user
// -----------------------------------------------------------------------------
exports.canViewUser = async (req, res, next) => {
    try {
        const requesterId = req.userId;
        const targetId = req.params.id;

        if (await exports.canAccessUser(requesterId, targetId)) return next();

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
        if (!await isSuperAdmin(decoded.id)) return res.status(403).json({ message: "Accès refusé" });

        const { userId, permissions } = req.body;

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
    const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Non authentifié" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

let query = `
  SELECT u.id, u.first_name, u.last_name, u.email, u.password,
         u.role, u.is_active, u.created_at, u.created_by,
         u.reset_token, u.reset_token_expire,
         u.phone,                                          
         CONCAT(u.first_name, ' ', u.last_name) AS display_name,
         t.grade AS specialization,
         t.rank,
         s.moyenne, s.status AS student_status, s.graduation_date, 
         s.speciality_id, s.promo_id,
         sp.name AS speciality_name,
         p.name AS promo_name,
         e.organization AS company_name, 
         e.position AS contact_person,
         e.phone AS external_phone,
         e.department AS department,
         a.permissions AS permissions
  FROM users u
  LEFT JOIN teacher t ON u.id = t.id
  LEFT JOIN student s ON u.id = s.id
  LEFT JOIN speciality sp ON s.speciality_id = sp.id
  LEFT JOIN promo p ON s.promo_id = p.id
  LEFT JOIN external_supervisor e ON u.id = e.id
  LEFT JOIN administrator a ON u.id = a.id
`;

    const params = [];

    // If not super admin → filter by allowed users
    if (!(await isSuperAdmin(userId))) {
      const [permsData] = await db.execute("SELECT * FROM user_permissions WHERE user_id = ?", [userId]);
      let allowedIds = [];
      if (permsData[0]?.allowed_user_ids) {
        try { allowedIds = JSON.parse(permsData[0].allowed_user_ids); } catch { allowedIds = []; }
      }

      if (allowedIds.length > 0) {
        query += ` WHERE u.id IN (${allowedIds.map(() => '?').join(',')})`;
        params.push(...allowedIds);
      } else {
        query += ` WHERE 0`;
      }
    }

    const [users] = await db.execute(query, params);
    res.json({ users });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// -----------------------------------------------------------------------------
// GET CURRENT USER INFO
// -----------------------------------------------------------------------------
exports.getMe = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [users] = await db.execute(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.phone,
            s.speciality_id                         
     FROM users u
     LEFT JOIN student s ON u.id = s.id              
     WHERE u.id = ?`,
    [decoded.id]
  );

    if (users.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const user = users[0];
    res.json({
      id:        user.id,
      firstName: user.first_name,
      lastName:  user.last_name,
      email:     user.email,
      role:      user.role,
      phone:     user.phone,
      speciality_id: user.speciality_id,
    });

  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// -----------------------------------------------------------------------------
// CHANGE PASSWORD
// -----------------------------------------------------------------------------
exports.changePassword = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Non authentifié" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId  = decoded.id;

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 6 caractères" });
    }

    // Get current user
    const [users] = await db.execute(
      "SELECT id, password FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Check current password is correct
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe actuel incorrect" });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId]
    );

    res.json({ message: "Mot de passe modifié avec succès" });

  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 ==============================================================================
 * END OF CONTROLLER
 ==============================================================================
 */