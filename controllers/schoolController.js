const db = require("../config/db");

// GET /api/specialities — with per-major stats
exports.getSpecialities = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        sp.id,
        sp.name,
        sp.code,
        sp.description,
        COUNT(DISTINCT CASE WHEN u.is_active = 1 THEN s.id END) AS student_count,
        COUNT(DISTINCT CASE WHEN p.status IN ('VALIDATED','ASSIGNED') THEN p.id END) AS project_count
      FROM speciality sp
      LEFT JOIN student s ON s.speciality_id = sp.id
      LEFT JOIN users u   ON u.id = s.id
      LEFT JOIN project p ON p.speciality_id = sp.id
      GROUP BY sp.id, sp.name, sp.code, sp.description
      ORDER BY sp.id
    `);
    res.json(rows);
  } catch (error) {
    console.error("getSpecialities error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/promos — unchanged
exports.getPromos = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM promo ORDER BY year DESC");
    res.json(rows);
  } catch (error) {
    console.error("getPromos error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/specialities/stats — global stats for the 3 header cards
exports.getStats = async (req, res) => {
  try {
    const [[majors]]   = await db.execute("SELECT COUNT(*) AS total FROM speciality");
    const [[students]] = await db.execute(
      `SELECT COUNT(DISTINCT s.id) AS total
       FROM student s JOIN users u ON u.id = s.id
       WHERE u.is_active = 1`
    );
    const [[projects]] = await db.execute(
      "SELECT COUNT(*) AS total FROM project WHERE status IN ('VALIDATED','ASSIGNED')"
    );

    res.json({
      totalMajors:   majors.total,
      totalStudents: students.total,
      totalProjects: projects.total,
    });
  } catch (error) {
    console.error("getStats error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// POST /api/specialities
exports.createSpeciality = async (req, res) => {
  try {
    const { code, name } = req.body;
    if (!code || !name) return res.status(400).json({ message: "Code and name are required" });
    await db.execute(
      "INSERT INTO speciality (code, name) VALUES (?, ?)",
      [code.trim(), name.trim()]
    );
    res.status(201).json({ message: "Major created successfully" });
  } catch (error) {
    console.error("createSpeciality error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PUT /api/specialities/:id
exports.updateSpeciality = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name } = req.body;
    if (!code || !name) return res.status(400).json({ message: "Code and name are required" });
    const [result] = await db.execute(
      "UPDATE speciality SET code = ?, name = ? WHERE id = ?",
      [code.trim(), name.trim(), id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "Major not found" });
    res.json({ message: "Major updated successfully" });
  } catch (error) {
    console.error("updateSpeciality error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// DELETE /api/specialities/:id
exports.deleteSpeciality = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check for active students
    const [[{ activeStudents }]] = await db.execute(
      `SELECT COUNT(DISTINCT s.id) AS activeStudents
       FROM student s
       JOIN users u ON u.id = s.id
       WHERE s.speciality_id = ? AND u.is_active = 1`,
      [id]
    );

    // ✅ Check for PENDING, VALIDATED or ASSIGNED projects
    const [[{ blockedProjects }]] = await db.execute(
      `SELECT COUNT(*) AS blockedProjects
       FROM project
       WHERE speciality_id = ? AND status IN ('PENDING', 'VALIDATED', 'ASSIGNED')`,
      [id]
    );

    if (activeStudents > 0 || blockedProjects > 0) {
      return res.status(409).json({
        message: "Cannot delete: major has active students or pending/validated/assigned projects linked to it",
      });
    }
      // ✅ ADD THIS — detach rejected projects before deleting
    await db.execute(
      `UPDATE project SET speciality_id = NULL WHERE speciality_id = ? AND status = 'REJECTED'`,
      [id]
    );
    const [result] = await db.execute("DELETE FROM speciality WHERE id = ?", [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Major not found" });

    res.json({ message: "Major deleted successfully" });
  } catch (error) {
    console.error("deleteSpeciality error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/promos — with student count (REPLACE the existing getPromos)
exports.getPromos = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        p.id,
        p.name,
        p.year,
        p.start_date,
        p.end_date,
        COUNT(DISTINCT s.id) AS student_count
      FROM promo p
      LEFT JOIN student s ON s.promo_id = p.id
      GROUP BY p.id, p.name, p.year, p.start_date, p.end_date
      ORDER BY p.end_date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("getPromos error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// POST /api/promos
exports.createPromo = async (req, res) => {
  try {
    const { name, year, start_date, end_date } = req.body;
    if (!name || !year || !start_date || !end_date)
      return res.status(400).json({ message: "All fields are required" });
    await db.execute(
      "INSERT INTO promo (name, year, start_date, end_date) VALUES (?, ?, ?, ?)",
      [name.trim(), parseInt(year), start_date, end_date]
    );
    res.status(201).json({ message: "Cohort created successfully" });
  } catch (error) {
    console.error("createPromo error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PUT /api/promos/:id  (edit name/year/dates)
exports.updatePromo = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, year, start_date, end_date } = req.body;
    if (!name || !year || !start_date || !end_date)
      return res.status(400).json({ message: "All fields are required" });
    const [result] = await db.execute(
      "UPDATE promo SET name = ?, year = ?, start_date = ?, end_date = ? WHERE id = ?",
      [name.trim(), parseInt(year), start_date, end_date, id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Cohort not found" });
    res.json({ message: "Cohort updated successfully" });
  } catch (error) {
    console.error("updatePromo error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PATCH /api/promos/:id/close  (set end_date = today to close it)
exports.closePromo = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute(
      "UPDATE promo SET end_date = CURDATE() WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Cohort not found" });
    res.json({ message: "Cohort closed successfully" });
  } catch (error) {
    console.error("closePromo error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// PATCH /api/promos/:id/open  (set end_date to original end or future date)
exports.openPromo = async (req, res) => {
  try {
    const { id } = req.params;
    const { end_date } = req.body;
    if (!end_date)
      return res.status(400).json({ message: "end_date is required to reopen" });
    const [result] = await db.execute(
      "UPDATE promo SET end_date = ? WHERE id = ?",
      [end_date, id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Cohort not found" });
    res.json({ message: "Cohort reopened successfully" });
  } catch (error) {
    console.error("openPromo error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/promos/active — only open promos for student assignment dropdown
exports.getActivePromos = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT id, name, year, start_date, end_date
      FROM promo
      WHERE end_date >= CURDATE()
      ORDER BY end_date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("getActivePromos error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};