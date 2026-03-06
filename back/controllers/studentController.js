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
            `SELECT u.id,u.email,u.role,
                    e.full_name,
                    e.student_id,
                    e.classe,
                    e.enrollment_date
             FROM users u
             JOIN etudiants e ON u.id = e.id
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

        await db.execute(
            `UPDATE etudiants
             SET full_name=?,classe=?
             WHERE id=?`,
             [full_name,classe,userId]
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
            `SELECT u.id,u.email,
                    e.full_name,
                    e.student_id,
                    e.classe
             FROM users u
             JOIN etudiants e
             ON u.id=e.id
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
