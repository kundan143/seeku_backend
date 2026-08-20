const moment = require("moment-timezone");
const { wfhRequests } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

// Employee self-request - starts Pending, needs admin approve/reject via approvalUpdateData.
// Unlike attendance_regularization (which corrects a PAST missed punch), WFH is requested in
// advance, so the date must be today or later rather than within a trailing window.
// True if this employee already has at least one non-deleted punch (device, import, or manual)
// recorded for this date - a day that's already punched can't also be marked WFH, either by
// the employee themselves or by HR/admin (see addDirect below).
async function hasExistingPunch(user_id, wfh_date) {
  const rows = await sequelize.query(
    `SELECT 1 FROM attendance_punches WHERE user_id = :user_id AND punch_date = :wfh_date AND is_deleted = 0 LIMIT 1`,
    { type: QueryTypes.SELECT, replacements: { user_id, wfh_date } }
  );
  return rows.length > 0;
}

exports.addData = async function (body) {
  try {
    const today = moment.tz("Asia/Kolkata").startOf("day");
    const wfhDate = moment.tz(body.data.wfh_date, "Asia/Kolkata").startOf("day");
    if (!wfhDate.isValid() || wfhDate.isBefore(today)) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "Work From Home can only be requested for today or a future date.";
      return responseCodes.BAD_REQUEST;
    }

    if (await hasExistingPunch(body.data.user_id, body.data.wfh_date)) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "You already have a punch recorded for this date, so it can't be marked as Work From Home.";
      return responseCodes.BAD_REQUEST;
    }

    const result = await wfhRequests.create({ ...body.data, status: 0, source: 'REQUEST' });
    responseCodes.SUCCESS.data = result.id;
    responseCodes.SUCCESS.message = "Work From Home Request Submitted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = e?.parent?.code === '23505'
      ? "A Work From Home request for this date is already pending or approved."
      : "Failed to Submit Work From Home Request";
    return responseCodes.BAD_REQUEST;
  }
};

// HR/admin direct entry - one or more employees, one or more dates, auto-approved on insert
// (no request/approval step). body.data is an array of {user_id, wfh_date} rows - the frontend
// expands "N employees x date range, Sundays/holidays excluded" into this flat list, same
// pattern as OP_AttendancePunch.addManualPunch.
exports.addDirect = async function (body) {
  try {
    const rows = Array.isArray(body.data) ? body.data : (body.data ? [body.data] : []);
    const created_by = body.created_by;
    const created_date = body.created_date;
    const reason = body.reason || null;

    if (!rows.length) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "No Work From Home days to add.";
      return responseCodes.BAD_REQUEST;
    }

    // Never trust the frontend's own holiday-skipping to have actually run - re-check every
    // row's date against holidays_master fresh here too, same convention as addManualPunch.
    const holidayRows = await sequelize.query(
      `SELECT holiday_date::TEXT AS holiday_date FROM holidays_master WHERE is_optional = false AND status = 1`,
      { type: QueryTypes.SELECT }
    );
    const holidayDates = new Set(holidayRows.map((h) => h.holiday_date));

    // A day already punched (device, import, or manual) can't also be marked WFH - fetch every
    // existing punch for the involved employees/date range in one shot rather than a query per
    // row, and key it the same way as the per-row check in addData.
    const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
    const wfhDatesOnly = rows.map((r) => String(r.wfh_date || '').slice(0, 10)).filter(Boolean);
    let punchedKeys = new Set();
    if (userIds.length && wfhDatesOnly.length) {
      const minDate = wfhDatesOnly.reduce((a, b) => (a < b ? a : b));
      const maxDate = wfhDatesOnly.reduce((a, b) => (a > b ? a : b));
      const punchRows = await sequelize.query(
        `SELECT DISTINCT user_id, punch_date::TEXT AS punch_date
         FROM attendance_punches
         WHERE user_id IN (:userIds) AND punch_date BETWEEN :minDate AND :maxDate AND is_deleted = 0`,
        { type: QueryTypes.SELECT, replacements: { userIds, minDate, maxDate } }
      );
      punchedKeys = new Set(punchRows.map((p) => `${p.user_id}|${p.punch_date}`));
    }

    let successCount = 0;
    let duplicateCount = 0;
    let holidaySkippedCount = 0;
    let punchExistsSkippedCount = 0;
    const failures = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (!row.user_id || !row.wfh_date) {
          throw new Error("Employee and WFH Date are required.");
        }
        const wfhDate = String(row.wfh_date).slice(0, 10);
        if (holidayDates.has(wfhDate)) {
          holidaySkippedCount++;
          continue;
        }
        if (punchedKeys.has(`${row.user_id}|${wfhDate}`)) {
          punchExistsSkippedCount++;
          continue;
        }
        await wfhRequests.create({
          user_id: row.user_id,
          wfh_date: wfhDate,
          reason,
          status: 1,
          source: 'ADMIN',
          approved_by: created_by,
          approved_date: created_date,
          is_deleted: 0,
          created_by,
          created_date,
        });
        successCount++;
      } catch (e) {
        if (e?.parent?.code === '23505') {
          duplicateCount++;
        } else {
          failures.push({ row: i + 1, user_id: row.user_id || null, error: e.message || 'Failed to add row.' });
        }
      }
    }

    responseCodes.SUCCESS.data = { successCount, duplicateCount, holidaySkippedCount, punchExistsSkippedCount, failedCount: failures.length, failures };
    responseCodes.SUCCESS.message = `Marked ${successCount} of ${rows.length} day(s) as WFH (${duplicateCount} already existed, ${holidaySkippedCount} skipped as holidays, ${punchExistsSkippedCount} skipped as already punched).`;
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Mark Work From Home";
    return responseCodes.BAD_REQUEST;
  }
};

exports.approvalUpdateData = async function (body) {
  try {
    await wfhRequests.update(body.data, { where: { id: body.id } });
    responseCodes.SUCCESS.data = body.id;
    responseCodes.SUCCESS.message = "Work From Home Request Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Work From Home Request";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  try {
    await wfhRequests.update(body.data, { where: { id: body.id } });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Work From Home Request Withdrawn Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Withdraw Work From Home Request";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getAllData = async function (body) {
  try {
    const bodyStatus = (body && body.status !== undefined && body.status !== null) ? `wr.status = ${Number(body.status)} and` : "";
    const query = `select wr.*, concat(emp.first_name, ' ', emp.last_name) as employee_name,
                    case
                      when wr.status = 0 then 'Pending'
                      when wr.status = 1 then 'Approved'
                      when wr.status = 2 then 'Rejected'
                      else 'Unknown'
                    end as status_name,
                    case
                      when wr.status = 0 then concat(cu.first_name, ' ', cu.last_name)
                      when wr.status = 1 then concat(au.first_name, ' ', au.last_name)
                      when wr.status = 2 then concat(ru.first_name, ' ', ru.last_name)
                      else ''
                    end as action_by_name,
                    case
                      when wr.status = 0 then wr.created_date
                      when wr.status = 1 then wr.approved_date
                      when wr.status = 2 then wr.rejected_date
                      else null
                    end as action_by_date
                  from wfh_requests wr
                  join users_master emp on emp.id = wr.user_id
                  left join users_master cu on cu.id = wr.created_by
                  left join users_master au on au.id = wr.approved_by
                  left join users_master ru on ru.id = wr.rejected_by
                  where ${bodyStatus} wr.is_deleted = 0
                  order by wr.id desc;`;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Work From Home Requests";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getByUser = async function (user_id) {
  try {
    const query = `select wr.*,
                    case
                      when wr.status = 0 then 'Pending'
                      when wr.status = 1 then 'Approved'
                      when wr.status = 2 then 'Rejected'
                      else 'Unknown'
                    end as status_name
                  from wfh_requests wr
                  where wr.user_id = :user_id and wr.is_deleted = 0
                  order by wr.wfh_date desc, wr.id desc;`;
    const data = await sequelize.query(query, { replacements: { user_id }, type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Work From Home Requests";
    return responseCodes.BAD_REQUEST;
  }
};
