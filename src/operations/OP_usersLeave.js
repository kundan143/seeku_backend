const {
  userLeavesDetails,
  userLeaveBalance,
  holidaysMaster,
} = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { Op, where, DATE, QueryTypes } = require("sequelize");

// Parses a 'YYYY-MM-DD' string into a local-time Date - avoids the classic `new Date("YYYY-MM-DD")`
// gotcha (parsed as UTC midnight, which shifts the apparent day-of-week whenever the server's
// timezone isn't UTC).
function parseLocalDate(dateStr) {
  const [y, m, d] = String(dateStr).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Calendar days in [start_date, end_date] (inclusive), minus Sundays and mandatory holidays -
// the authoritative "how many days is this leave actually for" figure. Computed server-side (not
// trusted from whichever of the several leave-apply UIs submitted the request) so every path -
// HR direct-entry, the shared apply-leave dialog, My Profile's own form - agrees, and so
// approvalUpdateData never has to re-derive it (and risk double-subtracting holidays) later.
async function computeWorkingDaysCount(startDate, endDate, transaction) {
  const holidaysCount = await holidaysMaster.count({
    where: {
      is_optional: false,
      status: 1,
      holiday_date: { [Op.between]: [startDate, endDate] },
    },
    transaction,
  });

  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  let sundaysCount = 0;
  const cur = new Date(start);
  while (cur <= end) {
    if (cur.getDay() === 0) {
      sundaysCount++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  const totalCalendarDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  return Math.max(0, totalCalendarDays - sundaysCount - holidaysCount);
}

exports.addData = async function (body) {
  const t = await sequelize.transaction();
  try {
    if (body.data.start_date && body.data.end_date) {
      body.data.total_days = await computeWorkingDaysCount(body.data.start_date, body.data.end_date, t);
      if (body.data.total_days <= 0) {
        await t.rollback();
        responseCodes.BAD_REQUEST.data = null;
        responseCodes.BAD_REQUEST.message = "Selected date range has no working days (Sundays/holidays are excluded).";
        return responseCodes.BAD_REQUEST;
      }
    }

    const result = await userLeavesDetails.create(body.data, {
      transaction: t,
    });

    await t.commit(); // ✅ Commit on success

    responseCodes.SUCCESS.data = result.id;
    responseCodes.SUCCESS.message = "Leave Added Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback(); // ❌ Rollback on failure

    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Leave";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateData = async function (body) {
  const t = await sequelize.transaction();
  try {
    if (body.data.start_date && body.data.end_date) {
      body.data.total_days = await computeWorkingDaysCount(body.data.start_date, body.data.end_date, t);
      if (body.data.total_days <= 0) {
        await t.rollback();
        responseCodes.BAD_REQUEST.data = null;
        responseCodes.BAD_REQUEST.message = "Selected date range has no working days (Sundays/holidays are excluded).";
        return responseCodes.BAD_REQUEST;
      }
    }

    await userLeavesDetails.update(body.data, {
      where: { id: body.id },
      transaction: t,
    });

    await t.commit();

    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Leave Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();

    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Leave";
    return responseCodes.BAD_REQUEST;
  }
};
exports.approvalUpdateData = async function (body) {
  const t = await sequelize.transaction();
  try {
    if (body.data.status === 1) {
      const userLeaveBalanceRecord = await userLeaveBalance.findOne({
        where: {
          user_id: body.data.user_id,
          leave_type_id: body.data.leave_type_id,
        },
        transaction: t,
      });

      if (!userLeaveBalanceRecord) {
        responseCodes.BAD_REQUEST.data = null;
        responseCodes.BAD_REQUEST.message = "User Leave Balance Not Found";
        return responseCodes.BAD_REQUEST;
      }

      // total_days is already Sundays/holidays-excluded, computed once and authoritatively by
      // addData/updateData at application time - no need (and it would be wrong) to subtract
      // holidays again here.
      const remainingDays = Number(userLeaveBalanceRecord.remaining_days);
      const usedDays = Number(userLeaveBalanceRecord.used_days);
      const actualLeave = Number(body.data.total_days);
      if (actualLeave <= 0) {
        responseCodes.BAD_REQUEST.data = null;
        responseCodes.BAD_REQUEST.message = "Invalid Leave Duration";
        return responseCodes.BAD_REQUEST;
      }
      if (remainingDays < actualLeave) {
        responseCodes.BAD_REQUEST.data = null;
        responseCodes.BAD_REQUEST.message = "Insufficient Leave Balance";
        return responseCodes.BAD_REQUEST;
      }
      const updatedUsedDays = Number((usedDays + actualLeave).toFixed(1));

      const updatedRemainingDays = Number((remainingDays - actualLeave).toFixed(1));

      await userLeaveBalance.update(
        {
          used_days: updatedUsedDays,
          remaining_days: updatedRemainingDays,
        },
        {
          where: {
            user_id: body.data.user_id,
            leave_type_id: body.data.leave_type_id,
          },
          transaction: t,
        }
      );

      await userLeavesDetails.update(body.data, {
        where: { id: body.id },
        transaction: t,
      });
    } else if (body.data.status === 2) {
      await userLeavesDetails.update(body.data, {
        where: { id: body.id },
        transaction: t,
      });
    }
    await t.commit();
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Leave Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Leave";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  const t = await sequelize.transaction();
  try {
    await userLeavesDetails.update(body.data, {
      where: { id: body.id },
      transaction: t,
    });

    await t.commit();

    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Leave Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Leave";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getAllData = async function (body) {
  try {
    let query = {};
    let bodyStatus = (body && body.status !== undefined && body.status !== null) ? `uld.status = ${Number(body.status)} and` : "";
    query = `SELECT uld.*, ltm.leave_name, CONCAT(emp.first_name, ' ', emp.last_name) as employee_name,
                    CASE
                        WHEN uld.status = 0 THEN 'Pending'
                        WHEN uld.status = 1 THEN 'Approved'
                        WHEN uld.status = 2 THEN 'Rejected'
                        ELSE 'Unknown'
                    END AS status_name,
                    CASE
                      WHEN uld.status = 0 THEN CONCAT(cu.first_name, ' ', cu.last_name)
                      WHEN uld.status = 1 THEN CONCAT(au.first_name, ' ', au.last_name)
                      WHEN uld.status = 2 THEN CONCAT(ru.first_name, ' ', ru.last_name)
                      ELSE ''
                  END AS action_by_name,
                  CASE
                      WHEN uld.status = 0 THEN uld.created_date
                      WHEN uld.status = 1 THEN uld.applied_date
                      WHEN uld.status = 2 THEN uld.rejected_date
                      ELSE null
                  END AS action_by_date
                FROM users_leave_details uld
                JOIN leave_type_master ltm ON ltm.id = uld.leave_type_id
                JOIN users_master emp ON emp.id = uld.user_id
                LEFT JOIN users_master cu ON cu.id = uld.created_by
                LEFT JOIN users_master au ON au.id = uld.approved_by
                LEFT JOIN users_master ru ON ru.id = uld.rejected_by
                WHERE ${bodyStatus} uld.status != 3
                ORDER BY uld.id DESC;`;
    const data = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getOneData = async function (id) {
  try {
    let query = {};
    query = `SELECT uld.*, ltm.leave_name,
                    CASE
                        WHEN uld.status = 0 THEN 'Pending'
                        WHEN uld.status = 1 THEN 'Approved'
                        WHEN uld.status = 2 THEN 'Rejected'
                        ELSE 'Unknown'
                    END AS status_name,
                    CASE
                      WHEN uld.status = 0 THEN CONCAT(cu.first_name, ' ', cu.last_name)
                      WHEN uld.status = 1 THEN CONCAT(au.first_name, ' ', au.last_name)
                      WHEN uld.status = 2 THEN CONCAT(ru.first_name, ' ', ru.last_name)
                      ELSE ''
                  END AS action_by_name,
                  CASE
                      WHEN uld.status = 0 THEN uld.created_date
                      WHEN uld.status = 1 THEN uld.applied_date
                      WHEN uld.status = 2 THEN uld.rejected_date
                      ELSE null
                  END AS action_by_date
                FROM users_leave_details uld
                JOIN leave_type_master ltm ON ltm.id = uld.leave_type_id
                LEFT JOIN users_master cu ON cu.id = uld.created_by
                LEFT JOIN users_master au ON au.id = uld.approved_by
                LEFT JOIN users_master ru ON ru.id = uld.rejected_by
                WHERE uld.status != 3 AND uld.user_id = ${id}
                ORDER BY uld.id DESC;`;
    const data = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};

// Approved-leave day totals per user overlapping [monthStart, monthEnd] ('YYYY-MM-DD'),
// bucketed by leave_code: LOP -> lop_days, HPL -> hpl_days, everything else -> other_leave_days.
// Internal cross-module helper for payroll — throws on error, not wrapped in responseCodes.
exports.getLeaveDaysSummary = async function (monthStart, monthEnd, userIds = null) {
  const query = `
    SELECT
      uld.user_id,
      ltm.leave_code,
      SUM(
        (LEAST(uld.end_date, :monthEnd::date) - GREATEST(uld.start_date, :monthStart::date)) + 1
      )::numeric AS overlap_days
    FROM users_leave_details uld
    JOIN leave_type_master ltm ON ltm.id = uld.leave_type_id
    WHERE uld.status = 1
      AND uld.start_date <= :monthEnd::date
      AND uld.end_date   >= :monthStart::date
      ${userIds && userIds.length ? "AND uld.user_id IN (:userIds)" : ""}
    GROUP BY uld.user_id, ltm.leave_code`;

  const rows = await sequelize.query(query, {
    replacements: { monthStart, monthEnd, userIds: userIds || [] },
    type: QueryTypes.SELECT,
  });

  const map = {};
  for (const r of rows) {
    const uid = r.user_id;
    if (!map[uid]) map[uid] = { lop_days: 0, hpl_days: 0, other_leave_days: 0 };
    const days = Number(r.overlap_days) || 0;
    const code = String(r.leave_code || "").trim().toUpperCase();
    if (code === "LOP") map[uid].lop_days += days;
    else if (code === "HPL") map[uid].hpl_days += days;
    else map[uid].other_leave_days += days;
  }
  return map;
};
