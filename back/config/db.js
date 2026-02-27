require("dotenv").config();
const mysql = require("mysql2");


//Un pool = groupe de connexions réutilisables.
const db = mysql.createPool({
  host: process.env.DB_HOST,               //process.env contient les variables de .env
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});


db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Erreur MySQL :", err);
  } else {
    console.log("✅ MySQL connecté !");
    connection.release();   //libérer la connexion pour qu’un autre utilisateur puisse l’utiliser dans le pool
  }
});

module.exports = db.promise();  