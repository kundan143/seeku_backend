const { userLeaveBalance, leaveBulkCreditLog, leaveTypeMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require("sequelize");
const currentYear = new Date().getFullYear();

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
