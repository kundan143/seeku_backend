const { userLeaveBalance, leaveBulkCreditLog, leaveTypeMaster, leaveEncashmentHistory } = require("../models");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require("sequelize");
const currentYear = new Date().getFullYear();

// Leave encashment - only the balance ABOVE this many days is convertible to cash, per
// (employee, leave type) row. Matches this screen's own remaining_days granularity rather than
// a company-wide total across every leave type.
const ENCASHMENT_THRESHOLD_DAYS = 15;

exports.addData = async function (body) {
  try {
    var result = await userLeaveBalance.create(body.data);
    responseCodes.SUCCESS.data = result.id;
    responseCodes.SUCCESS.message = "Row Added Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateData = async function (body) {
  try {
    await userLeaveBalance.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Row Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  try {
    await userLeaveBalance.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Row Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getAllData = async function (body) {
  try {
    let query = `select concat(um.first_name, ' ', um.last_name ) as user_name, 
                  concat(ltm.leave_name, ' (', ltm.leave_code,')') as leave_type, 
                  ulb.* 
                  from user_leave_balance ulb
                  join users_master um on um.id = ulb.user_id 
                  join leave_type_master ltm on ltm.id = ulb.leave_type_id 
                  where ulb.status = 1
                  order by ulb.id ASC;`;
    const data = await sequelize.query(query, {
      type: QueryTypes.SELECT,
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
    let query = `select ltm.leave_name as label, ltm.icon,
                  ulb.allocated_days as total, ulb.used_days as used,
                  ltm.color_code, ulb.remaining_days as remaining
                  from user_leave_balance ulb
                  join users_master um on um.id = ulb.user_id
                  join leave_type_master ltm on ltm.id = ulb.leave_type_id
                  where ulb.status = 1 and ulb.user_id = :id
                  order by ulb.id desc;`;
    const data = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT,
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
// Resolves a leave_code (e.g. 'PL') to its leave_type_master.id - keying the bulk-credit feature
// on the code rather than a hardcoded id, since the id is just an auto-increment and can differ
// across environments/seed data.
async function resolveLeaveTypeId(leave_code, transaction) {
  const leaveType = await leaveTypeMaster.findOne({ where: { leave_code, status: 1 }, transaction });
  return leaveType ? leaveType.id : null;
}

// Whether the "Add N days for all employees" bulk credit has already been used this calendar
// month for the given leave type - drives the button's visibility on the frontend.
exports.getBulkCreditStatus = async function (leave_code) {
  try {
    const leave_type_id = await resolveLeaveTypeId(leave_code);
    if (!leave_type_id) {
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = `Leave type '${leave_code}' not found`;
      return responseCodes.NOT_FOUND;
    }
    const now = new Date();
    const credited_month = now.getMonth() + 1;
    const credited_year = now.getFullYear();
    const existing = await leaveBulkCreditLog.findOne({
      where: { leave_type_id, credited_month, credited_year },
    });
    responseCodes.SUCCESS.data = {
      alreadyCredited: !!existing,
      credited_month,
      credited_year,
      log: existing,
    };
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Bulk Credit Status";
    return responseCodes.BAD_REQUEST;
  }
};

// Credits credit_days of the given leave type to every active employee, once per calendar month.
// The leave_bulk_credit_log row is inserted FIRST, inside the same transaction as the balance
// updates - its UNIQUE(leave_type_id, credited_month, credited_year) constraint is what actually
// enforces "once a month" (not just the frontend hiding the button), so a second attempt in the
// same month fails cleanly even under a race between two HR users.
exports.bulkCreditLeave = async function (body) {
  const t = await sequelize.transaction();
  try {
    const now = new Date();
    const credited_month = now.getMonth() + 1;
    const credited_year = now.getFullYear();
    const { leave_code, credit_days, created_by } = body;

    const leave_type_id = await resolveLeaveTypeId(leave_code, t);
    if (!leave_type_id) {
      await t.rollback();
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = `Leave type '${leave_code}' not found`;
      return responseCodes.NOT_FOUND;
    }

    let logRow;
    try {
      logRow = await leaveBulkCreditLog.create(
        { leave_type_id, credit_days, credited_month, credited_year, employees_count: 0, created_by, created_date: now },
        { transaction: t }
      );
    } catch (e) {
      await t.rollback();
      if (e.name === "SequelizeUniqueConstraintError") {
        responseCodes.BAD_REQUEST.data = null;
        responseCodes.BAD_REQUEST.message = "This leave type has already been credited for this month.";
        return responseCodes.BAD_REQUEST;
      }
      throw e;
    }

    await sequelize.query(
      `UPDATE user_leave_balance
       SET allocated_days = COALESCE(allocated_days, 0) + :credit_days,
           remaining_days = COALESCE(remaining_days, 0) + :credit_days,
           updated_by = :created_by,
           updated_date = :now
       WHERE leave_type_id = :leave_type_id AND status = 1`,
      { replacements: { credit_days, created_by, now, leave_type_id }, transaction: t }
    );

    // Any active employee who doesn't yet have a balance row for this leave type gets a fresh one.
    await sequelize.query(
      `INSERT INTO user_leave_balance (user_id, leave_type_id, allocated_days, used_days, remaining_days, status, created_by, created_date)
       SELECT um.id, :leave_type_id, :credit_days, 0, :credit_days, 1, :created_by, :now
       FROM users_master um
       WHERE um.status = true
       AND NOT EXISTS (
         SELECT 1 FROM user_leave_balance ulb WHERE ulb.user_id = um.id AND ulb.leave_type_id = :leave_type_id AND ulb.status = 1
       )`,
      { replacements: { leave_type_id, credit_days, created_by, now }, transaction: t }
    );

    const countRows = await sequelize.query(
      `SELECT COUNT(*)::int AS count FROM user_leave_balance WHERE leave_type_id = :leave_type_id AND status = 1`,
      { replacements: { leave_type_id }, transaction: t, type: QueryTypes.SELECT }
    );
    const employees_count = countRows[0]?.count || 0;
    await logRow.update({ employees_count }, { transaction: t });

    await t.commit();
    responseCodes.SUCCESS.data = { employees_count, credited_month, credited_year };
    responseCodes.SUCCESS.message = `Credited ${credit_days} day(s) leave to ${employees_count} employee(s).`;
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Credit Leave";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getTotalRemainingLeave = async function (id) {
  try {
    const totalRemainingLeave = await userLeaveBalance.sum("remaining_days", {
      where: {
        user_id: id,
        status: 1,
      },
    });
    responseCodes.SUCCESS.data = totalRemainingLeave;
		responseCodes.SUCCESS.message = "";
		return responseCodes.SUCCESS;
  } catch (error) {
    responseCodes.BAD_REQUEST.data = error;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};

// How much of one (employee, leave type) balance row can be converted to cash - only the
// portion above ENCASHMENT_THRESHOLD_DAYS, at the employee's current per-day gross rate (same
// gross_salary/30 divisor this app already uses for LOP/arrear/FNF proration elsewhere).
exports.previewEncashment = async function (leave_balance_id) {
  try {
    const rows = await sequelize.query(
      `SELECT ulb.id, ulb.user_id, ulb.leave_type_id, ulb.remaining_days,
              ltm.leave_name, ltm.leave_code,
              CONCAT(um.first_name, ' ', um.middle_name, ' ', um.last_name) AS emp_name
       FROM user_leave_balance ulb
       JOIN leave_type_master ltm ON ltm.id = ulb.leave_type_id
       JOIN users_master um ON um.id = ulb.user_id
       WHERE ulb.id = :leave_balance_id AND ulb.status = 1`,
      { replacements: { leave_balance_id }, type: QueryTypes.SELECT }
    );
    if (!rows.length) {
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Leave balance record not found";
      return responseCodes.NOT_FOUND;
    }
    const row = rows[0];
    const remainingDays = Number(row.remaining_days) || 0;
    const maxEncashableDays = Math.max(0, Math.round((remainingDays - ENCASHMENT_THRESHOLD_DAYS) * 100) / 100);

    const salaryRows = await sequelize.query(
      `SELECT gross_salary FROM users_salary_details
       WHERE user_id = :user_id AND status = 1 AND salary_type = 1
       ORDER BY id DESC LIMIT 1`,
      { replacements: { user_id: row.user_id }, type: QueryTypes.SELECT }
    );
    const grossMonthly = Number(salaryRows[0]?.gross_salary) || 0;
    const perDayAmount = Math.round((grossMonthly / 30) * 100) / 100;

    responseCodes.SUCCESS.data = {
      leave_balance_id: row.id,
      user_id: row.user_id,
      emp_name: row.emp_name,
      leave_type_id: row.leave_type_id,
      leave_name: row.leave_name,
      remaining_days: remainingDays,
      threshold_days: ENCASHMENT_THRESHOLD_DAYS,
      max_encashable_days: maxEncashableDays,
      per_day_amount: perDayAmount,
    };
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Calculate Encashment Preview";
    return responseCodes.BAD_REQUEST;
  }
};

// Converts encashed_days of one balance row to cash - moves the days from remaining_days to
// used_days (so allocated = used + remaining stays intact, same as any other leave consumption)
// and records the payout in leave_encashment_history. Re-validates the threshold/remaining-days
// server-side rather than trusting whatever the client sent, since this pays out real money.
exports.encashLeave = async function (body) {
  const t = await sequelize.transaction();
  try {
    const { leave_balance_id, encashed_days, remarks, created_by } = body;
    const days = Number(encashed_days);
    if (!leave_balance_id || !days || days <= 0) {
      await t.rollback();
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "leave_balance_id and a positive encashed_days are required";
      return responseCodes.BAD_REQUEST;
    }

    const balanceRow = await userLeaveBalance.findOne({ where: { id: leave_balance_id, status: 1 }, transaction: t });
    if (!balanceRow) {
      await t.rollback();
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Leave balance record not found";
      return responseCodes.NOT_FOUND;
    }

    const remainingDays = Number(balanceRow.remaining_days) || 0;
    const maxEncashableDays = Math.round((remainingDays - ENCASHMENT_THRESHOLD_DAYS) * 100) / 100;
    if (remainingDays <= ENCASHMENT_THRESHOLD_DAYS || days > maxEncashableDays) {
      await t.rollback();
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = `Only ${Math.max(0, maxEncashableDays)} day(s) above the ${ENCASHMENT_THRESHOLD_DAYS}-day threshold can be encashed.`;
      return responseCodes.BAD_REQUEST;
    }

    const salaryRows = await sequelize.query(
      `SELECT gross_salary FROM users_salary_details
       WHERE user_id = :user_id AND status = 1 AND salary_type = 1
       ORDER BY id DESC LIMIT 1`,
      { replacements: { user_id: balanceRow.user_id }, type: QueryTypes.SELECT, transaction: t }
    );
    const grossMonthly = Number(salaryRows[0]?.gross_salary) || 0;
    const perDayAmount = Math.round((grossMonthly / 30) * 100) / 100;
    const encashmentAmount = Math.round(days * perDayAmount * 100) / 100;

    await userLeaveBalance.update(
      {
        remaining_days: Math.round((remainingDays - days) * 100) / 100,
        used_days: Math.round(((Number(balanceRow.used_days) || 0) + days) * 100) / 100,
        updated_by: created_by,
        updated_date: body.created_date,
      },
      { where: { id: leave_balance_id }, transaction: t }
    );

    const historyRow = await leaveEncashmentHistory.create(
      {
        user_id: balanceRow.user_id,
        leave_type_id: balanceRow.leave_type_id,
        leave_balance_id,
        remaining_days_before: remainingDays,
        encashed_days: days,
        per_day_amount: perDayAmount,
        encashment_amount: encashmentAmount,
        remarks: remarks || null,
        created_by,
        created_date: body.created_date,
      },
      { transaction: t }
    );

    await t.commit();
    responseCodes.SUCCESS.data = { id: historyRow.id, encashment_amount: encashmentAmount };
    responseCodes.SUCCESS.message = `${days} day(s) encashed for ₹${encashmentAmount}`;
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Process Leave Encashment";
    return responseCodes.BAD_REQUEST;
  }
};

// Every past encashment, most recent first - global audit trail (not scoped to one employee),
// shown from the same Employee Leave Balance screen the Encash action lives on.
exports.getEncashmentHistory = async function () {
  try {
    const data = await sequelize.query(
      `SELECT leh.*, CONCAT(um.first_name, ' ', um.last_name) AS user_name,
              CONCAT(ltm.leave_name, ' (', ltm.leave_code, ')') AS leave_type
       FROM leave_encashment_history leh
       JOIN users_master um ON um.id = leh.user_id
       JOIN leave_type_master ltm ON ltm.id = leh.leave_type_id
       ORDER BY leh.id DESC`,
      { type: QueryTypes.SELECT }
    );
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Encashment History";
    return responseCodes.BAD_REQUEST;
  }
};
