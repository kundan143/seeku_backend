const {
  userLeavesDetails,
  userLeaveBalance,
  holidaysMaster,
} = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { Op, where, DATE, QueryTypes } = require("sequelize");

exports.addData = async function (body) {
  const t = await sequelize.transaction();
  try {
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
      // Approved
      const currentYear = new Date().getFullYear();
      const userLeaveBalanceRecord = await userLeaveBalance.findOne({
        where: {
          user_id: body.data.user_id,
          leave_type_id: body.data.leave_type_id,
          year: currentYear,
        },
        transaction: t,
      });

      if (!userLeaveBalanceRecord) {
        responseCodes.BAD_REQUEST.data = null;
        responseCodes.BAD_REQUEST.message = "User Leave Balance Not Found";
        return responseCodes.BAD_REQUEST;
      }

      const holidaysCount = await holidaysMaster.count({
        where: {
          is_optional: false,
          status: 1,
          holiday_date: {
            [Op.between]: [body.data.start_date, body.data.end_date],
          },
        },
        transaction: t,
      });

      const remainingDays = Number(userLeaveBalanceRecord.remaining_days);
      const usedDays = Number(userLeaveBalanceRecord.used_days);
      const totalDays = Number(body.data.total_days);
      const actualLeave = totalDays - holidaysCount;
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
            year: currentYear,
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
    let bodyStatus = body.status ? `uld.status = ${body.status} and` : "";
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
