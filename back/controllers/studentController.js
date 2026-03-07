const db = require("../config/db");

/**
 =============================
 GET MY PROFILE
 =============================
*/
exports.getMyProfile = async (req, res) => {
    try {

        const userId = req.user.id;

        const [student] = await db.execute(
            `SELECT u.id,u.email,u.role, u.first_name, u.last_name,
                    s.moyenne, s.status, s.graduation_date, s.speciality_id, s.promo_id
             FROM user u
             JOIN student s ON u.id = s.id
             WHERE u.id = ?`,
            [userId]
        );

        if(student.length === 0){
            return res.status(404).json({
                message:"Etudiant introuvable"
            })
        }

        res.json(student[0]);

    } catch(err){
        console.error(err)
        res.status(500).json({
            message:"Erreur serveur"
        })
    }
};


/**
 =============================
 UPDATE PROFILE
 =============================
*/

exports.updateMyProfile = async (req,res)=>{

    try{

        const userId = req.user.id;

        const {
            full_name,
            classe
        } = req.body;

        const nameParts = full_name.split(' ');
        const first_name = nameParts[0] || '';
        const last_name = nameParts.slice(1).join(' ') || '';

        // Update user table
        await db.execute(
            `UPDATE user
             SET first_name=?, last_name=?
             WHERE id=?`,
             [first_name, last_name, userId]
        );

        // Update student table
        await db.execute(
            `UPDATE student
             SET promo_id=?
             WHERE id=?`,
             [classe, userId]
        );

        res.json({
            message:"Profil mis à jour"
        })

    }catch(err){

        console.error(err)

        res.status(500).json({
            message:"Erreur serveur"
        })

    }

}


/**
 =============================
 GET STUDENT BY ID
 =============================
*/

exports.getStudentById = async (req,res)=>{

    try{

        const studentId = req.params.id;

        const [student] = await db.execute(
            `SELECT u.id,u.email, u.first_name, u.last_name,
                    s.moyenne, s.status, s.graduation_date, s.speciality_id, s.promo_id
             FROM user u
             JOIN student s
             ON u.id=s.id
             WHERE u.id=?`,
            [studentId]
        );

        if(student.length===0){

            return res.status(404).json({
                message:"Etudiant non trouvé"
            })

        }

        res.json(student[0])

    }catch(err){

        console.error(err)

        res.status(500).json({
            message:"Erreur serveur"
        })

    }

}
