const { userLeaveBalance, usersMaster } = require("../../models");
const { sequelize } = require("../../config/database-connection");
const logger = require("../../services/dailyLogService");

const MONTHLY_ACCRUAL_DAYS = 2;
const SYSTEM_USER_ID = 1;

// Runs 00:01 AM on the 1st of every month: adds MONTHLY_ACCRUAL_DAYS to
// allocated_days for every active user_leave_balance row of the current year,
// and keeps remaining_days consistent with the new allocation. Active users
// who don't yet have a row for a given leave_type_id this year are seeded
// with a fresh allocation instead of being accrued on top of nothing.
exports.updateLeaveBalanceAllocation = async function () {
  const currentYear = new Date().getFullYear();
  const t = await sequelize.transaction();
  try {
    const rows = await userLeaveBalance.findAll({
      where: { status: 1, year: currentYear },
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
    for (const [leave_type_id, existingUserIds] of existingUserIdsByLeaveType) {
      const missingUserIds = activeUserIds.filter((id) => !existingUserIds.has(id));
      for (const user_id of missingUserIds) {
        await userLeaveBalance.create(
          {
            user_id,
            leave_type_id,
            year: currentYear,
            allocated_days: MONTHLY_ACCRUAL_DAYS,
            used_days: 0,
            remaining_days: MONTHLY_ACCRUAL_DAYS,
            carry_forward_days: 0,
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
      const allocated_days = Number(row.allocated_days || 0) + MONTHLY_ACCRUAL_DAYS;
      const carry_forward_days = Number(row.carry_forward_days || 0);
      const used_days = Number(row.used_days || 0);
      const remaining_days = allocated_days + carry_forward_days - used_days;

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
      message: "updateLeaveBalanceAllocation: monthly leave accrual applied",
      year: currentYear,
      rowsUpdated: rows.length,
      rowsInserted,
      accrualDays: MONTHLY_ACCRUAL_DAYS,
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
