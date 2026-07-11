const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

// Employee Master is the screen HR/admins use to browse other employees'
// records; view or edit access there is what legitimately lets someone
// reach another user's profile/leave/salary/expense data via My Profile.
const EMPLOYEE_MASTER_LINK = "/hr/employee-master";

// True if requesterId is viewing their own record, or holds view/edit
// permission on Employee Master (looked up by link so the menu_master id
// doesn't need to be hardcoded per environment).
async function canAccessUserRecord(requesterId, targetId) {
  if (!requesterId || !targetId) return false;
  if (String(requesterId) === String(targetId)) return true;

  const rows = await sequelize.query(
    `SELECT 1 FROM menu_permission mp
     JOIN menu_master mm ON mm.id = mp.menu_id
     WHERE mp.user_id = :requesterId
       AND mm.link = :link
       AND (mp.view_opt = 1 OR mp.edit_opt = 1)
     LIMIT 1`,
    { type: QueryTypes.SELECT, replacements: { requesterId, link: EMPLOYEE_MASTER_LINK } }
  );

  return rows.length > 0;
}

module.exports = { canAccessUserRecord };
