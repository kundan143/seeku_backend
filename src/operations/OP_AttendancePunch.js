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

// Manual punches for one or more employees, for cases a biometric device missed (or there's no
// device at all) - the MANUAL source value the punch_date column comment already anticipated
// but no code path ever used until now. HR picks employees directly (no biometric_emp_code
// mapping needed, unlike bulkImport). body.data is an array of {user_id, punch_time, direction}
// rows - the frontend expands "N employees x date range, Sundays/holidays excluded" into this
// flat list before calling in, same per-row create/duplicate/failure handling as bulkImport.
exports.addManualPunch = async function (body) {
  try {
    const rows = Array.isArray(body.data) ? body.data : (body.data ? [body.data] : []);
    const created_by = body.created_by;
    const created_date = body.created_date;

    if (!rows.length) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "No punches to add.";
      return responseCodes.BAD_REQUEST;
    }

    // Never trust the frontend's own holiday-skipping to have actually run (a stale cached
    // holiday list, or a direct API call bypassing the UI entirely) - re-check every row's date
    // against holidays_master fresh here, same "recompute server-side" convention as PF/PT/ESI.
    // Optional holidays are left workable, matching payroll's own working-day convention.
    const holidayRows = await sequelize.query(
      `SELECT holiday_date::TEXT AS holiday_date FROM holidays_master WHERE is_optional = false AND status = 1`,
      { type: QueryTypes.SELECT }
    );
    const holidayDates = new Set(holidayRows.map((h) => h.holiday_date));

    let successCount = 0;
    let duplicateCount = 0;
    let holidaySkippedCount = 0;
    const failures = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (!row.user_id || !row.punch_time) {
          throw new Error("Employee and Punch Time are required.");
        }
        const punchTime = new Date(row.punch_time);
        if (isNaN(punchTime.getTime())) {
          throw new Error("Invalid Punch Time.");
        }
        const punchDate = punchTime.toISOString().slice(0, 10);
        if (holidayDates.has(punchDate)) {
          holidaySkippedCount++;
          continue;
        }
        await attendancePunches.create({
          user_id: row.user_id,
          punch_time: punchTime,
          punch_date: punchDate,
          direction: row.direction || null,
          device_emp_code: null,
          source: 'MANUAL',
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

    responseCodes.SUCCESS.data = { successCount, duplicateCount, holidaySkippedCount, failedCount: failures.length, failures };
    responseCodes.SUCCESS.message = `Added ${successCount} of ${rows.length} punch(es) (${duplicateCount} already existed, ${holidaySkippedCount} skipped as holidays).`;
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Punches";
    return responseCodes.BAD_REQUEST;
  }
};

// One row per day in the given month, with the earliest and latest punch of that day.
// Days that have no raw punches but DO have an approved regularization still show up, using the
// employee's requested in/out times, flagged via is_regularized. An approved WFH day shows up
// too, with no punch times at all (there's nothing to show - see is_wfh).
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
                    ),
                    wfh_summary as (
                      select wfh_date as punch_date
                      from wfh_requests
                      where user_id = :user_id
                        and status = 1
                        and is_deleted = 0
                        and extract(year from wfh_date) = :year
                        and extract(month from wfh_date) = :month
                    )
                    select coalesce(ps.punch_date, rs.punch_date, ws.punch_date) as punch_date,
                      coalesce(ps.first_punch, rs.first_punch) as first_punch,
                      coalesce(ps.last_punch, rs.last_punch) as last_punch,
                      coalesce(ps.punch_count, 0) as punch_count,
                      (rs.punch_date is not null) as is_regularized,
                      (ws.punch_date is not null) as is_wfh
                    from punch_summary ps
                    full outer join reg_summary rs on rs.punch_date = ps.punch_date
                    full outer join wfh_summary ws on ws.punch_date = coalesce(ps.punch_date, rs.punch_date)
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
// Same approved-regularization/WFH merge as getMonthSummaryByUser, across all employees.
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
                    ),
                    wfh_summary as (
                      select user_id, wfh_date as punch_date
                      from wfh_requests
                      where status = 1
                        and is_deleted = 0
                        and wfh_date between :from_date and :to_date
                        ${userFilter}
                    )
                    select coalesce(ps.user_id, rs.user_id, ws.user_id) as user_id,
                      CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) as user_name,
                      coalesce(ps.punch_date, rs.punch_date, ws.punch_date) as punch_date,
                      coalesce(ps.first_punch, rs.first_punch) as first_punch,
                      coalesce(ps.last_punch, rs.last_punch) as last_punch,
                      coalesce(ps.punch_count, 0) as punch_count,
                      (rs.punch_date is not null) as is_regularized,
                      (ws.punch_date is not null) as is_wfh
                    from punch_summary ps
                    full outer join reg_summary rs on rs.user_id = ps.user_id and rs.punch_date = ps.punch_date
                    full outer join wfh_summary ws on ws.user_id = coalesce(ps.user_id, rs.user_id) and ws.punch_date = coalesce(ps.punch_date, rs.punch_date)
                    join users_master um on um.id = coalesce(ps.user_id, rs.user_id, ws.user_id)
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

// Company-wide "today" snapshot for dashboard widgets - every active employee classified into
// exactly one of Present / Late / WFH / Absent, so the four counts sum to total headcount.
// WFH takes priority (an approved WFH day is never also "late"), then a real punch is Present
// (or Late, if its first punch is after the current attendance_policy's office_start_time +
// grace_period_minutes), then an approved regularization with no punch still counts as Present
// (attendance was corrected even though nothing was actually punched), and anyone left over is
// Absent.
exports.getTodayStats = async function () {
  try {
    const query = `
      with policy as (
        select office_start_time, grace_period_minutes
        from attendance_policy
        where is_deleted = 0 and effective_from <= current_date
        order by effective_from desc, id desc
        limit 1
      ),
      active_employees as (
        select id as user_id from users_master where status = true
      ),
      todays_wfh as (
        select distinct user_id from wfh_requests
        where wfh_date = current_date and status = 1 and is_deleted = 0
      ),
      todays_punch as (
        select user_id, min(punch_time) as first_punch
        from attendance_punches
        where punch_date = current_date and is_deleted = 0
        group by user_id
      ),
      todays_reg as (
        select distinct user_id from attendance_regularization
        where punch_date = current_date and status = 1 and is_deleted = 0
      ),
      classified as (
        select ae.user_id,
          case
            when wfh.user_id is not null then 'WFH'
            when tp.first_punch is not null and p.office_start_time is not null
              and tp.first_punch::time > (p.office_start_time + (coalesce(p.grace_period_minutes, 0) || ' minutes')::interval)
            then 'LATE'
            when tp.first_punch is not null or reg.user_id is not null then 'PRESENT'
            else 'ABSENT'
          end as bucket
        from active_employees ae
        left join todays_wfh wfh on wfh.user_id = ae.user_id
        left join todays_punch tp on tp.user_id = ae.user_id
        left join todays_reg reg on reg.user_id = ae.user_id
        left join policy p on true
      )
      select
        count(*) filter (where bucket = 'PRESENT') as present_count,
        count(*) filter (where bucket = 'LATE') as late_count,
        count(*) filter (where bucket = 'WFH') as wfh_count,
        count(*) filter (where bucket = 'ABSENT') as absent_count
      from classified;`;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data[0] || { present_count: 0, late_count: 0, wfh_count: 0, absent_count: 0 };
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Today's Attendance Stats";
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
