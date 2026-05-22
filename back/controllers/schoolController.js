const db = require("../config/db");

exports.getSpecialities = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM speciality");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getPromos = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM promo");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};