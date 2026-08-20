const { incentiveMaster, employeeIncentiveDetails, usersMaster } = require("../../models");
const { sequelize } = require("../../config/database-connection");
const logger = require("../../services/dailyLogService");

const SYSTEM_USER_ID = 1;

// How many periods per year a scheme's annual incentive_amount is split across for
// flat-type amounts. Percentage-type amounts are never split - the full stored
// incentive_amount is added each time this job runs, regardless of frequency.
function getPeriodsPerYear(frequency) {
  switch (frequency) {
    case "monthly":
      return 12;
    case "quarterly":
      return 4;
    case "half_yearly":
      return 2;
    case "yearly":
    default:
      return 1;
  }
}

// employee_id set -> that one employee; else department_id set -> that department's
// active employees; else (both null) -> every active employee company-wide.
async function resolveEmployeeIds(scheme, transaction) {
  if (scheme.employee_id) {
    const employee = await usersMaster.findOne({
      where: { id: scheme.employee_id, status: true },
      attributes: ["id"],
      transaction,
    });
    return employee ? [employee.id] : [];
  }

  const where = { status: true };
  if (scheme.department_id) {
    where.department_id = scheme.department_id;
  }
  const employees = await usersMaster.findAll({ where, attributes: ["id"], transaction });
  return employees.map((employee) => employee.id);
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

// The incentive cycle runs November-October rather than the calendar year, labeled by its
// starting year (Nov 2025-Oct 2026 = fiscal year 2025).
function getFiscalYear(date) {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return month >= 11 ? year : year - 1;
}

// Month position within the fiscal year: November = 1 ... October = 12.
function getFiscalMonth(date) {
  const month = date.getMonth() + 1;
  return ((month - 11 + 12) % 12) + 1;
}

// Which period (within the current fiscal year) a scheme is currently in, per its
// frequency - monthly tracks by fiscal month (12 periods/year), quarterly by fiscal
// quarter (4 periods/year), half_yearly by fiscal half (2 periods/year), yearly is always
// period 1 (a single period spanning the whole fiscal year).
function getCurrentPeriod(frequency, fiscalMonth) {
  switch (frequency) {
    case "monthly":
      return fiscalMonth;
    case "quarterly":
      return Math.ceil(fiscalMonth / 3);
    case "half_yearly":
      return Math.ceil(fiscalMonth / 6);
    case "yearly":
    default:
      return 1;
  }
}

// Runs 00:05 AM on the 1st of every month: every active incentive_master scheme (status = 1)
// contributes its installment once per its own period - monthly once per fiscal month (up
// to 12x/year), quarterly once per fiscal quarter (up to 4x/year), half_yearly once per
// fiscal half (up to 2x/year), yearly once per fiscal year (1x/year) - tracked via
// last_accrued_year/last_accrued_period so re-triggering this job within the same period
// never double-accrues a scheme, regardless of frequency. Adds each targeted employee's
// installment onto a single running total for the current fiscal year (one row per
// employee per fiscal year). If several schemes target the same employee in the same run
// (e.g. a company-wide monthly scheme plus one scoped to that employee_id specifically),
// their amounts are summed before being added to that employee's fiscal-year row.
exports.accrueEmployeeIncentiveDetails = async function () {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const fiscalYear = getFiscalYear(now);
  const fiscalMonth = getFiscalMonth(now);

  const t = await sequelize.transaction();
  try {
    const schemes = await incentiveMaster.findAll({
      where: { status: 1 },
      transaction: t,
    });

    let schemesProcessed = 0;
    const employeeAmounts = new Map();

    for (const scheme of schemes) {
      const currentPeriod = getCurrentPeriod(scheme.frequency, fiscalMonth);
      if (scheme.last_accrued_year === fiscalYear && scheme.last_accrued_period === currentPeriod) continue;

      const periodsPerYear = getPeriodsPerYear(scheme.frequency);
      schemesProcessed++;

      const employeeIds = await resolveEmployeeIds(scheme, t);

      for (const employee_id of employeeIds) {
        const amount =
          scheme.value_type === "percentage"
            ? round2(Number(scheme.incentive_amount))
            : round2(Number(scheme.incentive_amount) / periodsPerYear);

        employeeAmounts.set(employee_id, round2((employeeAmounts.get(employee_id) || 0) + amount));
      }

      await scheme.update({ last_accrued_year: fiscalYear, last_accrued_period: currentPeriod }, { transaction: t });
    }

    let rowsInserted = 0;
    let rowsUpdated = 0;

    for (const [employee_id, amount] of employeeAmounts) {
      const existing = await employeeIncentiveDetails.findOne({
        where: { employee_id, year: fiscalYear },
        transaction: t,
      });

      if (existing) {
        await existing.update(
          { amount: round2(Number(existing.amount) + amount), modified_by: SYSTEM_USER_ID, modified_date: new Date() },
          { transaction: t }
        );
        rowsUpdated++;
      } else {
        await employeeIncentiveDetails.create(
          {
            employee_id,
            year: fiscalYear,
            amount,
            status: 1,
            created_by: SYSTEM_USER_ID,
            created_date: new Date(),
          },
          { transaction: t }
        );
        rowsInserted++;
      }
    }

    await t.commit();
    logger.info({
      message: "accrueEmployeeIncentiveDetails: incentive accrual applied",
      fiscalYear,
      month: currentMonth,
      schemesProcessed,
      rowsInserted,
      rowsUpdated,
    });
    return { fiscalYear, month: currentMonth, schemesProcessed, rowsInserted, rowsUpdated };
  } catch (e) {
    await t.rollback();
    logger.error({
      message: "accrueEmployeeIncentiveDetails: failed to apply incentive accrual",
      error: e.message,
    });
    throw e;
  }
};
