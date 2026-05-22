// utils/scheduleConflicts.js
const db = require("../config/db");

const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const timesConflict = (timeA, timeB) => Math.abs(toMinutes(timeA) - toMinutes(timeB)) < 120;

const checkRoomConflict = async (room, date, time, excludeId = null) => {
  const [rows] = await db.execute(
    `SELECT id, time FROM soutenance WHERE room_name = ? AND date = ? AND id != ?`,
    [room, date, excludeId || 0]
  );
  for (const row of rows) {
    if (row.time && timesConflict(time, row.time)) return row;
  }
  return null;
};

const checkJuryConflict = async (teacherId, date, time, excludeId = null) => {
  const [rows] = await db.execute(
    `SELECT s.id, s.time, sj.role
     FROM soutenance_jury sj
     JOIN soutenance s ON s.id = sj.soutenance_id
     WHERE sj.teacher_id = ? AND s.date = ? AND s.id != ?`,
    [teacherId, date, excludeId || 0]
  );
  for (const row of rows) {
    if (row.time && timesConflict(time, row.time)) return row;
  }
  return null;
};

module.exports = { timesConflict, checkRoomConflict, checkJuryConflict };