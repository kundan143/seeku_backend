const { attendancePunches, usersMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");
const transporter = require("../services/mailTransporterService");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
        select id as user_id, concat(first_name, ' ', middle_name, ' ', last_name) as user_name
        from users_master where status = true
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
      )
      select ae.user_id, ae.user_name,
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
      order by ae.user_name asc;`;
    const rows = await sequelize.query(query, { type: QueryTypes.SELECT });

    const counts = { present_count: 0, late_count: 0, wfh_count: 0, absent_count: 0 };
    rows.forEach((r) => {
      if (r.bucket === 'PRESENT') counts.present_count++;
      else if (r.bucket === 'LATE') counts.late_count++;
      else if (r.bucket === 'WFH') counts.wfh_count++;
      else if (r.bucket === 'ABSENT') counts.absent_count++;
    });

    responseCodes.SUCCESS.data = { ...counts, rows };
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Today's Attendance Stats";
    return responseCodes.BAD_REQUEST;
  }
};

// Monthly Sheet: every active employee x every day of the given month, already classified into
// P (Present) / HD (Half Day) / WFH / A (Absent) / '-' (week off or holiday), pivoted into
// {days, rows} so the frontend can render it directly with no date/hours math of its own.
// Priority per day: week off/holiday > WFH > a real punch (hours-based) > approved
// regularization with no punch time (counts as Present) > nothing at all (Absent).
// 2nd/4th Saturdays are half working days - the Present threshold drops from 8 hrs to 4 hrs.
exports.getMonthlySheet = async function (body) {
  try {
    const year = Number(body.year);
    const month = Number(body.month); // 1-12
    const daysInMonth = new Date(year, month, 0).getDate();
    const pad = (n) => String(n).padStart(2, '0');
    const fromDate = `${year}-${pad(month)}-01`;
    const toDate = `${year}-${pad(month)}-${pad(daysInMonth)}`;

    const query = `with days as (
                      select generate_series(:fromDate::date, :toDate::date, interval '1 day')::date as punch_date
                    ),
                    relevant_employees as (
                      -- Currently-active employees, PLUS anyone who has any activity in this
                      -- month even if they've since left (status = false) - so a past month's
                      -- sheet doesn't retroactively lose someone who worked it just because
                      -- they're no longer employed today. doj gates days before they joined.
                      select id as user_id, concat(first_name, ' ', middle_name, ' ', last_name) as user_name,
                        to_char(doj, 'YYYY-MM-DD') as doj
                      from users_master um
                      where status = true
                         or id in (
                           select user_id from attendance_punches where is_deleted = 0 and punch_date between :fromDate and :toDate
                           union select user_id from attendance_regularization where status = 1 and is_deleted = 0 and punch_date between :fromDate and :toDate
                           union select user_id from wfh_requests where status = 1 and is_deleted = 0 and wfh_date between :fromDate and :toDate
                           union select user_id from users_leave_details where status = 1 and start_date <= :toDate and end_date >= :fromDate
                         )
                    ),
                    punch_summary as (
                      select user_id, punch_date,
                        min(punch_time) as first_punch,
                        max(punch_time) as last_punch,
                        count(*) as punch_count
                      from attendance_punches
                      where is_deleted = 0 and punch_date between :fromDate and :toDate
                      group by user_id, punch_date
                    ),
                    reg_summary as (
                      select user_id, punch_date,
                        case when requested_in_time is not null then (punch_date + requested_in_time)::timestamp end as first_punch,
                        case when requested_out_time is not null then (punch_date + requested_out_time)::timestamp end as last_punch
                      from attendance_regularization
                      where status = 1 and is_deleted = 0 and punch_date between :fromDate and :toDate
                    ),
                    wfh_summary as (
                      select user_id, wfh_date as punch_date
                      from wfh_requests
                      where status = 1 and is_deleted = 0 and wfh_date between :fromDate and :toDate
                    ),
                    holiday_days as (
                      select holiday_date as punch_date
                      from holidays_master
                      where status = 1 and is_optional = false and holiday_date between :fromDate and :toDate
                    ),
                    leave_summary as (
                      select uld.user_id, uld.start_date, uld.end_date, ltm.leave_code
                      from users_leave_details uld
                      join leave_type_master ltm on ltm.id = uld.leave_type_id
                      where uld.status = 1
                        and uld.start_date <= :toDate
                        and uld.end_date >= :fromDate
                    )
                    select
                      e.user_id,
                      e.user_name,
                      e.doj,
                      to_char(d.punch_date, 'YYYY-MM-DD') as punch_date,
                      coalesce(ps.first_punch, rs.first_punch) as first_punch,
                      coalesce(ps.last_punch, rs.last_punch) as last_punch,
                      coalesce(ps.punch_count, 0) as punch_count,
                      (rs.punch_date is not null) as is_regularized,
                      (ws.punch_date is not null) as is_wfh,
                      (hd.punch_date is not null) as is_holiday,
                      (extract(dow from d.punch_date) = 0) as is_sunday,
                      ls.leave_code
                    from days d
                    cross join relevant_employees e
                    left join punch_summary ps on ps.user_id = e.user_id and ps.punch_date = d.punch_date
                    left join reg_summary rs on rs.user_id = e.user_id and rs.punch_date = d.punch_date
                    left join wfh_summary ws on ws.user_id = e.user_id and ws.punch_date = d.punch_date
                    left join holiday_days hd on hd.punch_date = d.punch_date
                    left join lateral (
                      select leave_code from leave_summary ls2
                      where ls2.user_id = e.user_id and d.punch_date between ls2.start_date and ls2.end_date
                      limit 1
                    ) ls on true
                    order by e.user_name asc, d.punch_date asc;`;
    const rows = await sequelize.query(query, { replacements: { fromDate, toDate }, type: QueryTypes.SELECT });

    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${pad(month)}-${pad(d)}`;
      days.push({
        dateStr,
        dayNum: d,
        weekday: new Date(year, month - 1, d).toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }

    const isHalfDaySaturday = (dateStr) => {
      const [y, m, dd] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, dd);
      if (date.getDay() !== 6) {
        return false;
      }
      const occurrence = Math.ceil(dd / 7);
      return occurrence === 2 || occurrence === 4;
    };

    const computeStatus = (row) => {
      if (row.doj && row.punch_date < row.doj) {
        return { code: '-', cls: 'off', title: 'Not Yet Joined' };
      }
      if (row.is_holiday) {
        return { code: 'HOL', cls: 'off', title: 'Holiday' };
      }
      if (row.is_sunday) {
        return { code: '-', cls: 'off', title: 'Week Off' };
      }
      // An approved leave application covering this day is authoritative over any incidental
      // punch/WFH record - it deducted from user_leave_balance (see OP_usersLeave.approvalUpdateData,
      // which already refuses to approve a leave the balance can't cover), so it's a Paid Leave
      // day, not Absent/LOP. The one exception is the "LOP" leave type itself (leave_code = 'LOP'),
      // which by definition is an unpaid leave application - that stays a LOP day.
      if (row.leave_code) {
        return String(row.leave_code).trim().toUpperCase() === 'LOP'
          ? { code: 'LOP', cls: 'a', title: 'Leave (Loss of Pay)' }
          : { code: 'PL', cls: 'pl', title: 'Paid Leave' };
      }
      if (row.is_wfh) {
        return { code: 'WFH', cls: 'wfh', title: 'Work From Home' };
      }
      if (row.first_punch && row.last_punch) {
        const hours = (new Date(row.last_punch).getTime() - new Date(row.first_punch).getTime()) / 3600000;
        const threshold = isHalfDaySaturday(row.punch_date) ? 4 : 8;
        return hours >= threshold
          ? { code: 'P', cls: 'p', title: `Present (${hours.toFixed(1)} hrs)` }
          : { code: 'HD', cls: 'hd', title: `Half Day (${hours.toFixed(1)} hrs)` };
      }
      if (row.is_regularized) {
        return { code: 'P', cls: 'p', title: 'Present (regularized)' };
      }
      return { code: 'A', cls: 'a', title: 'Absent' };
    };

    const rowsByUser = new Map();
    const dayFlagsByDate = new Map(); // dateStr -> { is_holiday, is_sunday } - same for every employee
    rows.forEach((r) => {
      if (!rowsByUser.has(r.user_id)) {
        rowsByUser.set(r.user_id, { user_id: r.user_id, user_name: r.user_name, doj: r.doj, cells: {} });
      }
      rowsByUser.get(r.user_id).cells[r.punch_date] = computeStatus(r);
      if (!dayFlagsByDate.has(r.punch_date)) {
        dayFlagsByDate.set(r.punch_date, { is_holiday: r.is_holiday, is_sunday: r.is_sunday });
      }
    });

    // Matches OP_salaryPayment.getMonthWorkingDays exactly, so this sheet's Working/Present/LOP
    // columns agree with what payroll will actually calculate for the same month: every month is
    // treated as exactly 30 days (day 31, if any, is dropped), and Sunday is normally a paid
    // weekly off (stays part of the 30, always counts as present) with a holiday normally
    // excluded from the working-day count entirely.
    //
    // Sandwich rule: if the employee has ANY Absent day anywhere that month, every Sunday and
    // Holiday that month loses its paid/neutral treatment too - each becomes a counted working
    // day with zero present credit (i.e. also LOP), not just the ones adjacent to the absence.
    //
    // A Paid Leave (PL) day is fully neutral like a holiday - it's excluded from both Working
    // Days and Present Days entirely, so it never shows up as LOP (unlike an LOP-type leave
    // application, which is treated the same as an unexplained Absence).
    const PAYROLL_MONTH_DAYS = 30;
    rowsByUser.forEach((entry) => {
      // An LOP-type leave application is a Loss of Pay day just like an unexplained Absence -
      // both trigger the sandwich rule above.
      const hasAnyAbsent = Object.values(entry.cells).some((c) => c.code === 'A' || c.code === 'LOP');

      let workingDays = 0;
      let presentDays = 0;
      for (let d = 1; d <= Math.min(daysInMonth, PAYROLL_MONTH_DAYS); d++) {
        const dateStr = `${year}-${pad(month)}-${pad(d)}`;
        if (entry.doj && dateStr < entry.doj) {
          // Not yet employed - fully neutral, same treatment as a Paid Leave day.
          continue;
        }
        const flags = dayFlagsByDate.get(dateStr);
        if (flags?.is_sunday) {
          workingDays++;
          if (!hasAnyAbsent) {
            presentDays += 1;
          }
          continue;
        }
        if (flags?.is_holiday) {
          if (hasAnyAbsent) {
            workingDays++;
          }
          continue;
        }
        const cell = entry.cells[dateStr];
        if (cell?.code === 'PL') {
          // Paid, approved leave - fully neutral like a holiday, doesn't count toward Working
          // Days or Present Days (so it never shows as LOP), even under the sandwich rule.
          continue;
        }
        workingDays++;
        if (cell?.code === 'P' || cell?.code === 'WFH') {
          presentDays += 1;
        } else if (cell?.code === 'HD') {
          presentDays += 0.5;
        }
        // 'LOP' and 'A' both contribute 0 - already a Loss of Pay day.
      }
      entry.total_working_days = workingDays;
      entry.total_present_days = Math.round(presentDays * 10) / 10;
      entry.lop_days = Math.max(0, Math.round((workingDays - presentDays) * 10) / 10);
    });

    responseCodes.SUCCESS.data = { days, rows: Array.from(rowsByUser.values()) };
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Monthly Sheet";
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

// Shared by every "email this exported sheet" action below - same branded header/footer as
// the salary-slip email, parameterized so each caller only supplies its own heading/body copy.
async function sendReportEmail({ recipients, fileName, fileBase64, subject, heading, bodyHtml }) {
  const html = `
    <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="650" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e5e5;">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="background:#0d6efd;padding:30px;">
                      <h2 style="margin:0;color:#ffffff;font-size:28px;">
                        Advance Cable Technologies Ltd.
                      </h2>
                      <p style="margin:8px 0 0;color:#eaf2ff;font-size:16px;">
                        ${heading}
                      </p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      ${bodyHtml}
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;">
                        <tr>
                          <td align="center">
                            <div style="display:inline-block;background:#e8f4ff;border:1px solid #cfe2ff;padding:18px 25px;border-radius:8px;color:#0d6efd;font-size:15px;">
                              📎 <strong>The report (Excel) is attached with this email.</strong>
                            </div>
                          </td>
                        </tr>
                      </table>
                      <p style="font-size:15px;color:#555;line-height:26px;">For any queries or clarification regarding this report, please contact the HR Department.</p>
                      <br>
                      <p style="margin:0;font-size:15px;color:#333;">Best Regards,</p>
                      <p style="margin-top:8px;font-size:15px;color:#333;">
                        <strong>HR Department</strong><br>Advance Cable Technologies Ltd.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td align="center" style="background:#f8f9fa;padding:25px;font-size:12px;color:#777;line-height:20px;">
                      This is an automatically generated email. Please do not reply to this email.<br>
                      For any queries, please contact the HR Department.<br><br>
                      © ${new Date().getFullYear()} Advance Cable Technologies Ltd. All Rights Reserved.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>`;

  await transporter.sendMail({
    from: process.env.EXP_HANDLE_USER_NAME || 'Advance Cable Technologies <tech@advancecable.in>',
    to: recipients.join(', '),
    subject,
    html,
    attachments: [
      {
        filename: fileName,
        content: fileBase64,
        encoding: 'base64',
      },
    ],
  });
}

// Validates the recipient list + attachment payload shared by every "email this exported
// sheet" action below. Returns either { recipients } on success, or { errorResponse } to
// return as-is.
function validateEmailReportRequest(body) {
  const recipients = (Array.isArray(body.recipient_emails) ? body.recipient_emails : String(body.recipient_emails || '').split(/[,;]/))
    .map((e) => String(e || '').trim())
    .filter(Boolean);

  if (!recipients.length) {
    responseCodes.BAD_REQUEST.data = null;
    responseCodes.BAD_REQUEST.message = "Enter at least one recipient email address.";
    return { errorResponse: responseCodes.BAD_REQUEST };
  }
  const invalid = recipients.filter((e) => !EMAIL_RE.test(e));
  if (invalid.length) {
    responseCodes.BAD_REQUEST.data = null;
    responseCodes.BAD_REQUEST.message = `Invalid email address: ${invalid.join(', ')}`;
    return { errorResponse: responseCodes.BAD_REQUEST };
  }
  if (!body.file_base64) {
    responseCodes.BAD_REQUEST.data = null;
    responseCodes.BAD_REQUEST.message = "No file to email.";
    return { errorResponse: responseCodes.BAD_REQUEST };
  }
  return { recipients };
}

// Emails an already-built Monthly Sheet workbook (generated client-side with SheetJS) to
// whichever addresses HR typed into the export dialog. The workbook itself is not rebuilt
// here - the frontend sends the exact same base64 .xlsx it would otherwise download, so what
// gets emailed is guaranteed identical to what "Export" would have produced.
exports.emailMonthlySheet = async function (body) {
  try {
    const { recipients, errorResponse } = validateEmailReportRequest(body);
    if (errorResponse) return errorResponse;

    const monthLabel = body.month_label || 'the selected period';
    await sendReportEmail({
      recipients,
      fileName: body.file_name || 'Monthly_Sheet.xlsx',
      fileBase64: body.file_base64,
      subject: `Attendance Monthly Sheet — ${monthLabel}`,
      heading: 'Attendance Monthly Sheet',
      bodyHtml: `
        <p style="font-size:16px;color:#333;margin-top:0;">Dear Team,</p>
        <p style="font-size:15px;color:#555;line-height:26px;">Please find attached the <strong>Attendance Monthly Sheet</strong> for <strong>${monthLabel}</strong>, covering every employee's daily attendance status along with Working Days, Present Days and LOP Days for the period.</p>`,
    });

    responseCodes.SUCCESS.data = { sent_to: recipients };
    responseCodes.SUCCESS.message = `Monthly Sheet emailed to ${recipients.join(', ')}`;
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to email Monthly Sheet";
    return responseCodes.BAD_REQUEST;
  }
};

// Emails the Attendance tab's currently-filtered list (same rows "Excel"/"PDF" would have
// exported) to whichever addresses HR types into the Email dialog.
exports.emailAttendanceReport = async function (body) {
  try {
    const { recipients, errorResponse } = validateEmailReportRequest(body);
    if (errorResponse) return errorResponse;

    const rangeLabel = body.report_label || 'the selected range';
    await sendReportEmail({
      recipients,
      fileName: body.file_name || 'Attendance_Report.xlsx',
      fileBase64: body.file_base64,
      subject: `Attendance Report — ${rangeLabel}`,
      heading: 'Attendance Report',
      bodyHtml: `
        <p style="font-size:16px;color:#333;margin-top:0;">Dear Team,</p>
        <p style="font-size:15px;color:#555;line-height:26px;">Please find attached the <strong>Attendance Report</strong> for <strong>${rangeLabel}</strong>.</p>`,
    });

    responseCodes.SUCCESS.data = { sent_to: recipients };
    responseCodes.SUCCESS.message = `Attendance Report emailed to ${recipients.join(', ')}`;
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to email Attendance Report";
    return responseCodes.BAD_REQUEST;
  }
};
