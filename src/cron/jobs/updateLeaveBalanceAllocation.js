const { userLeaveBalance, usersMaster, leaveTypeMaster } = require("../../models");
const { sequelize } = require("../../config/database-connection");
const logger = require("../../services/dailyLogService");

const SYSTEM_USER_ID = 1;

// Monthly accrual rate for a leave type is its yearly_limit / 12 (editable from the Leave Type
// Master screen) - previously a single flat constant applied identically to every leave type
// regardless of what its yearly_limit said, which made that column purely cosmetic.
function monthlyAccrualFor(leaveType) {
  return Number(leaveType?.yearly_limit || 0) / 12;
}

// Runs 00:01 AM on the 1st of every month: adds each leave type's monthly accrual rate to
// allocated_days for every active user_leave_balance row (balances are ongoing now, not
// reset/reseeded per calendar year), and keeps remaining_days consistent with the new
// allocation. Active users who don't yet have a row at all for a given ACTIVE leave type are
// seeded with a fresh allocation instead of being accrued on top of nothing - this covers both an
// existing type a new employee hasn't been given yet, and a brand-new leave type just added from
// the Leave Type Master screen that has no balance rows anywhere yet (a plain "does a row already
// exist for this type" check would otherwise never seed it for anyone, ever).
exports.updateLeaveBalanceAllocation = async function () {
  const t = await sequelize.transaction();
  try {
    const leaveTypes = await leaveTypeMaster.findAll({
      attributes: ["id", "yearly_limit"],
      transaction: t,
    });
    const accrualByLeaveType = new Map(leaveTypes.map((lt) => [lt.id, monthlyAccrualFor(lt)]));

    const activeLeaveTypes = await leaveTypeMaster.findAll({
      where: { status: 1 },
      attributes: ["id"],
      transaction: t,
    });

    const rows = await userLeaveBalance.findAll({
      where: { status: 1 },
      transaction: t,
    });

    const existingUserIdsByLeaveType = new Map();
    for (const row of rows) {
      if (!existingUserIdsByLeaveType.has(row.leave_type_id)) {
        existingUserIdsByLeaveType.set(row.leave_type_id, new Set());
      }
      existingUserIdsByLeaveType.get(row.leave_type_id).add(row.user_id);
    }

    const activeUsers = await usersMaster.findAll({
      where: { status: true },
      attributes: ["id"],
      transaction: t,
    });
    const activeUserIds = activeUsers.map((u) => u.id);

    let rowsInserted = 0;
    for (const leaveType of activeLeaveTypes) {
      const accrual = accrualByLeaveType.get(leaveType.id) ?? 0;
      const existingUserIds = existingUserIdsByLeaveType.get(leaveType.id) || new Set();
      const missingUserIds = activeUserIds.filter((id) => !existingUserIds.has(id));
      for (const user_id of missingUserIds) {
        await userLeaveBalance.create(
          {
            user_id,
            leave_type_id: leaveType.id,
            allocated_days: accrual,
            used_days: 0,
            remaining_days: accrual,
            status: 1,
            created_by: SYSTEM_USER_ID,
            created_date: new Date(),
          },
          { transaction: t }
        );
        rowsInserted++;
      }
    }

    for (const row of rows) {
      const accrual = accrualByLeaveType.get(row.leave_type_id) ?? 0;
      const allocated_days = Number(row.allocated_days || 0) + accrual;
      const used_days = Number(row.used_days || 0);
      const remaining_days = allocated_days - used_days;

      await row.update(
        {
          allocated_days,
          remaining_days,
          updated_date: new Date(),
        },
        { transaction: t }
      );
    }

    await t.commit();
    logger.info({
      message: "updateLeaveBalanceAllocation: monthly leave accrual applied (per leave type's yearly_limit / 12)",
      rowsUpdated: rows.length,
      rowsInserted,
    });
  } catch (e) {
    await t.rollback();
    logger.error({
      message: "updateLeaveBalanceAllocation: failed to apply monthly leave accrual",
      error: e.message,
    });
    throw e;
  }
};
