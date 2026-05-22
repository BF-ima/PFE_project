// services/groupService.js
const db = require("../config/db");

/**
 * Creates the two group conversations for a team.
 *
 * Call sites:
 *  - createGroupConversations(teamId, null)          → after createTeam()
 *  - createGroupConversations(teamId, supervisorId)  → after assignProject()
 *
 * Rules:
 *  - "team" conversation is created once when the team is first formed.
 *    If it already exists the call is a no-op (idempotent).
 *  - "team_supervisor" conversation is created (or updated) when a project
 *    is assigned and we know who the supervisor is.
 */
exports.createGroupConversations = async (teamId, supervisorId = null) => {
  // ── 1. "team" conversation (students only) ──────────────────────────────
  // Guard: create only if it doesn't already exist for this team
  const [existingTeam] = await db.execute(
    `SELECT id FROM group_conversation
     WHERE team_id = ? AND group_type = 'team' LIMIT 1`,
    [teamId]
  );

  if (existingTeam.length === 0) {
    await db.execute(
      `INSERT INTO group_conversation (team_id, group_type, supervisor_id, created_at)
       VALUES (?, 'team', NULL, NOW())`,
      [teamId]
    );
  }

  // ── 2. "team_supervisor" conversation ───────────────────────────────────
  // Only created when we have an actual supervisor (project assigned)
  if (supervisorId) {
    const [existingSup] = await db.execute(
      `SELECT id FROM group_conversation
       WHERE team_id = ? AND group_type = 'team_supervisor' LIMIT 1`,
      [teamId]
    );

    if (existingSup.length === 0) {
      await db.execute(
        `INSERT INTO group_conversation (team_id, group_type, supervisor_id, created_at)
         VALUES (?, 'team_supervisor', ?, NOW())`,
        [teamId, supervisorId]
      );
    } else {
      // If it already exists (e.g. project was re-assigned), keep supervisor up to date
      await db.execute(
        `UPDATE group_conversation SET supervisor_id = ?
         WHERE team_id = ? AND group_type = 'team_supervisor'`,
        [supervisorId, teamId]
      );
    }
  }
};