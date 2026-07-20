const { userLeaveBalance } = require("../../models");
const { sequelize } = require("../../config/database-connection");
const logger = require("../../services/dailyLogService");

const MONTHLY_ACCRUAL_DAYS = 2;

// Runs 00:01 AM on the 1st of every month: adds MONTHLY_ACCRUAL_DAYS to
// allocated_days for every active user_leave_balance row of the current year,
// and keeps remaining_days consistent with the new allocation.
exports.updateLeaveBalanceAllocation = async function () {
  const currentYear = new Date().getFullYear();
  const t = await sequelize.transaction();
  try {
    const rows = await userLeaveBalance.findAll({
      where: { status: 1, year: currentYear },
      transaction: t,
    });

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
