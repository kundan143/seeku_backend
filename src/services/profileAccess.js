const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

// Employee Master is the screen HR/admins use to browse other employees'
// records; view or edit access there is what legitimately lets someone
// reach another user's profile/leave/salary/expense data via My Profile.
const EMPLOYEE_MASTER_LINK = "/hr/employee-master";

// True if this user's role has role_master.is_super_admin set.
async function isSuperAdminUser(userId) {
  if (!userId) return false;
  const rows = await sequelize.query(
    `SELECT 1 FROM users_master um
     JOIN role_master rm ON rm.id = um.role_id
     WHERE um.id = :userId AND rm.is_super_admin = TRUE
     LIMIT 1`,
    { type: QueryTypes.SELECT, replacements: { userId } }
  );
  return rows.length > 0;
}

// True if the given role itself is a Super Admin role.
async function isSuperAdminRole(roleId) {
  if (!roleId) return false;
  const rows = await sequelize.query(
    `SELECT 1 FROM role_master WHERE id = :roleId AND is_super_admin = TRUE LIMIT 1`,
    { type: QueryTypes.SELECT, replacements: { roleId } }
  );
  return rows.length > 0;
}

// True if requesterId is viewing their own record, holds a Super Admin role (role_master.
// is_super_admin - full access by design, see logingServiceRouter.js), or holds view/edit
// permission on Employee Master (looked up by link so the menu_master id doesn't need to be
// hardcoded per environment).
async function canAccessUserRecord(requesterId, targetId) {
  if (!requesterId || !targetId) return false;
  if (String(requesterId) === String(targetId)) return true;
  if (await isSuperAdminUser(requesterId)) return true;

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

module.exports = { canAccessUserRecord, isSuperAdminUser, isSuperAdminRole };
