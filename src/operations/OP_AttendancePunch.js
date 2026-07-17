const { attendancePunches, usersMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

// Resolves a device employee code to a system user_id, with an in-request cache
// so the same code isn't looked up twice within one bulk import.
async function resolveUserByCode(code, cache) {
  const trimmed = String(code || '').trim();
  if (!trimmed) {
    return null;
  }
  if (cache[trimmed] !== undefined) {
    return cache[trimmed];
  }
  const user = await usersMaster.findOne({ where: { biometric_emp_code: trimmed } });
  const id = user ? user.id : null;
  cache[trimmed] = id;
  return id;
}

exports.bulkImport = async function (body) {
  try {
    const rows = Array.isArray(body.data) ? body.data : [];
    const created_by = body.created_by;
    const created_date = body.created_date;

    if (!rows.length) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "No rows to import.";
      return responseCodes.BAD_REQUEST;
    }

    const userCache = {};
    let successCount = 0;
    let duplicateCount = 0;
    const failures = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (!row.device_emp_code || !row.punch_time) {
          throw new Error("Employee Code and Punch Time are required.");
        }
        const punchTime = new Date(row.punch_time);
        if (isNaN(punchTime.getTime())) {
          throw new Error("Invalid Punch Time.");
        }
        const user_id = await resolveUserByCode(row.device_emp_code, userCache);
        if (!user_id) {
          throw new Error(`Employee Code "${row.device_emp_code}" is not mapped to any employee - map it first.`);
        }
        await attendancePunches.create({
          user_id,
          punch_time: punchTime,
          punch_date: punchTime.toISOString().slice(0, 10),
          direction: row.direction || null,
          device_emp_code: String(row.device_emp_code).trim(),
          source: 'IMPORT',
          is_deleted: 0,
          created_by,
          created_date,
        });
        successCount++;
      } catch (e) {
        if (e?.parent?.code === '23505') {
          duplicateCount++;
        } else {
          failures.push({
            row: i + 2,
            device_emp_code: row.device_emp_code || '',
            error: e.message || 'Failed to import row.',
          });
        }
      }
    }

    responseCodes.SUCCESS.data = { successCount, duplicateCount, failedCount: failures.length, failures };
    responseCodes.SUCCESS.message = `Imported ${successCount} of ${rows.length} punches (${duplicateCount} already existed).`;
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Import Attendance";
    return responseCodes.BAD_REQUEST;
  }
};

// One row per day in the given month, with the earliest and latest punch of that day.
// Days that have no raw punches but DO have an approved regularization still show up,
// using the employee's requested in/out times, and are flagged via is_regularized.
exports.getMonthSummaryByUser = async function (body) {
  try {
    const { user_id, year, month } = body;
    const query = `with punch_summary as (
                      select punch_date,
                        min(punch_time) as first_punch,
                        max(punch_time) as last_punch,
                        count(*) as punch_count
                      from attendance_punches
                      where user_id = :user_id
                        and is_deleted = 0
                        and extract(year from punch_date) = :year
                        and extract(month from punch_date) = :month
                      group by punch_date
                    ),
                    reg_summary as (
                      select punch_date,
                        (punch_date + coalesce(requested_in_time, '00:00'))::timestamp as first_punch,
                        (punch_date + coalesce(requested_out_time, requested_in_time, '00:00'))::timestamp as last_punch
                      from attendance_regularization
                      where user_id = :user_id
                        and status = 1
                        and is_deleted = 0
                        and extract(year from punch_date) = :year
                        and extract(month from punch_date) = :month
                    )
                    select coalesce(ps.punch_date, rs.punch_date) as punch_date,
                      coalesce(ps.first_punch, rs.first_punch) as first_punch,
                      coalesce(ps.last_punch, rs.last_punch) as last_punch,
                      coalesce(ps.punch_count, 0) as punch_count,
                      (rs.punch_date is not null) as is_regularized
                    from punch_summary ps
                    full outer join reg_summary rs on rs.punch_date = ps.punch_date
                    order by punch_date asc;`;
    const data = await sequelize.query(query, { replacements: { user_id, year, month }, type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Attendance";
    return responseCodes.BAD_REQUEST;
  }
};

// Admin view: every employee x day in a date range, with first/last punch.
// Same approved-regularization merge as getMonthSummaryByUser, across all employees.
exports.getAllSummary = async function (body) {
  try {
    const { from_date, to_date, user_id } = body;
    const userFilter = user_id ? `and user_id = :user_id` : '';
    const query = `with punch_summary as (
                      select user_id, punch_date,
                        min(punch_time) as first_punch,
                        max(punch_time) as last_punch,
                        count(*) as punch_count
                      from attendance_punches
                      where is_deleted = 0
                        and punch_date between :from_date and :to_date
                        ${userFilter}
                      group by user_id, punch_date
                    ),
                    reg_summary as (
                      select user_id, punch_date,
                        (punch_date + coalesce(requested_in_time, '00:00'))::timestamp as first_punch,
                        (punch_date + coalesce(requested_out_time, requested_in_time, '00:00'))::timestamp as last_punch
                      from attendance_regularization
                      where status = 1
                        and is_deleted = 0
                        and punch_date between :from_date and :to_date
                        ${userFilter}
                    )
                    select coalesce(ps.user_id, rs.user_id) as user_id,
                      concat(um.first_name, ' ', um.last_name) as user_name,
                      coalesce(ps.punch_date, rs.punch_date) as punch_date,
                      coalesce(ps.first_punch, rs.first_punch) as first_punch,
                      coalesce(ps.last_punch, rs.last_punch) as last_punch,
                      coalesce(ps.punch_count, 0) as punch_count,
                      (rs.punch_date is not null) as is_regularized
                    from punch_summary ps
                    full outer join reg_summary rs on rs.user_id = ps.user_id and rs.punch_date = ps.punch_date
                    join users_master um on um.id = coalesce(ps.user_id, rs.user_id)
                    order by punch_date desc, user_name asc;`;
    const data = await sequelize.query(query, { replacements: { from_date, to_date, user_id: user_id || null }, type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Attendance";
    return responseCodes.BAD_REQUEST;
  }
};

// Drill-down: every raw punch for one employee on one day.
exports.getRawPunchesByUserDate = async function (body) {
  try {
    const { user_id, punch_date } = body;
    const query = `select * from attendance_punches
                    where user_id = :user_id and punch_date = :punch_date and is_deleted = 0
                    order by punch_time asc;`;
    const data = await sequelize.query(query, { replacements: { user_id, punch_date }, type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Punches";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getUsersWithCodes = async function () {
  try {
    const query = `select id, concat(first_name, ' ', last_name) as name, biometric_emp_code
                    from users_master
                    where status = true
                    order by first_name asc;`;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Employees";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  try {
    await attendancePunches.update(
      { is_deleted: 1, modified_by: body.data.modified_by, modified_date: body.data.modified_date },
      { where: { id: body.id } }
    );
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Punch Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Punch";
    return responseCodes.BAD_REQUEST;
  }
};
