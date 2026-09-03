const { salaryPayment, pdfTemplateMaster, salarySlipMailLog } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes, Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const transporter = require("../services/mailTransporterService");
const OP_usersLeave = require("./OP_usersLeave");
const { mergeTemplate, renderHtmlToPdfFile, getLogoDataUri } = require("../services/pdfTemplateService");
const logger = require("../services/dailyLogService");

exports.addData = async function (body) {
  const t = await sequelize.transaction();
  try {
    const result = await salaryPayment.create(body.data, { transaction: t });
    await t.commit();
    responseCodes.SUCCESS.data = result.id;
    responseCodes.SUCCESS.message = "Salary Payment Added Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Salary Payment";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateData = async function (body) {
  const t = await sequelize.transaction();
  try {
    await salaryPayment.update(body.data, {
      where: { id: body.id },
      transaction: t,
    });
    await t.commit();
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Salary Payment Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Salary Payment";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  const t = await sequelize.transaction();
  try {
    await salaryPayment.update(body.data, {
      where: { id: body.id },
      transaction: t,
    });
    await t.commit();
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Salary Payment Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Salary Payment";
    return responseCodes.BAD_REQUEST;
  }
};

exports.markAsPaid = async function (body) {
  const t = await sequelize.transaction();
  try {
    const where = Array.isArray(body.id) ? { id: { [Op.in]: body.id } } : { id: body.id };
    await salaryPayment.update(body.data, {
      where,
      transaction: t,
    });
    await t.commit();
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = Array.isArray(body.id)
      ? `${body.id.length} Salary Payment(s) Marked as Paid Successfully`
      : "Salary Marked as Paid Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Mark Salary as Paid";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getAllData = async function () {
  try {
    const query = `
      SELECT sp.*,
             CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS emp_name,
             dm.name  AS department_name, um.email,
             dm2.designation AS designation_name,
             lm.name AS location_name,
             TO_CHAR(TO_DATE(sp.payment_month::TEXT, 'MM'), 'Month') AS month_name
      FROM salary_payments sp
      LEFT JOIN users_master      um   ON um.id   = sp.user_id
      LEFT JOIN department_master dm   ON dm.id   = um.department_id
      LEFT JOIN designation_master dm2 ON dm2.id  = um.designation_id
      LEFT JOIN office_location_master lm ON lm.id = um.location_id
      WHERE sp.status = 1
      ORDER BY sp.payment_year DESC, sp.payment_month DESC, sp.id DESC`;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Salary Payments";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getOneData = async function (id) {
  try {
    const query = `
      SELECT sp.*,
             CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS emp_name,
             um.mobile, um.email, um.doj,um.email,
             dm.name  AS department_name,
             dm2.designation AS designation_name,
             TO_CHAR(TO_DATE(sp.payment_month::TEXT, 'MM'), 'Month') AS month_name
      FROM salary_payments sp
      LEFT JOIN users_master       um   ON um.id   = sp.user_id
      LEFT JOIN department_master  dm   ON dm.id   = um.department_id
      LEFT JOIN designation_master dm2  ON dm2.id  = um.designation_id
      WHERE sp.id = :id AND sp.status = 1
      LIMIT 1`;
    const data = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });
    if (data.length) {
      responseCodes.SUCCESS.data = data[0];
      responseCodes.SUCCESS.message = "";
      return responseCodes.SUCCESS;
    } else {
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "No Record Found";
      return responseCodes.NOT_FOUND;
    }
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Salary Payment";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getDataByUserId = async function (user_id) {
  try {
    const query = `
      SELECT sp.*,
             CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS emp_name,
             TO_CHAR(TO_DATE(sp.payment_month::TEXT, 'MM'), 'Month') AS month_name
      FROM salary_payments sp
      LEFT JOIN users_master um ON um.id = sp.user_id
      WHERE sp.user_id = :user_id AND sp.status = 1
      ORDER BY sp.payment_year DESC, sp.payment_month DESC`;
    const data = await sequelize.query(query, {
      replacements: { user_id },
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Salary Payments";
    return responseCodes.BAD_REQUEST;
  }
};

async function getMonthWorkingDays(payment_month, payment_year) {
  const year  = parseInt(payment_year,  10);
  const month = parseInt(payment_month, 10);

  // const daysInMonth = new Date(year, month, 0).getDate();
  const daysInMonth = 30;

  // Collect all Sunday dates in the month
  const sundaySet = new Set();
  for (let d = 1; d <= daysInMonth; d++) {
    if (new Date(year, month - 1, d).getDay() === 0) {
      sundaySet.add(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
  }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate   = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  // Fetch all mandatory holidays in this month
  const holidays = await sequelize.query(
    `SELECT holiday_date::TEXT AS holiday_date, holiday_name
     FROM holidays_master
     WHERE holiday_date >= :startDate
       AND holiday_date <= :endDate
       AND is_optional = false
       AND status = 1
     ORDER BY holiday_date`,
    { replacements: { startDate, endDate }, type: QueryTypes.SELECT }
  );

  // Only count holidays that do NOT fall on Sunday (avoid double-deducting)
  const nonSundayHolidays = holidays.filter(h => !sundaySet.has(h.holiday_date.slice(0, 10)));

  return {
    total_days:      daysInMonth,
    sundays:         sundaySet.size,
    public_holidays: nonSundayHolidays.length,
    working_days:    daysInMonth - nonSundayHolidays.length,
    holiday_list:    holidays,
    start_date:      startDate,
    end_date:        endDate,
  };
}

// Present/Paid days from working days + approved-leave breakdown + HR's manual unapproved/LOP input.
// leave: { lop_days, hpl_days, other_leave_days } (all default 0 when the employee has no leave this month)
function computeAttendance(workingDays, leave, manualUnapprovedLeaveDays) {
  const lop    = Number(leave?.lop_days || 0);
  const hpl    = Number(leave?.hpl_days || 0);
  const other  = Number(leave?.other_leave_days || 0);
  const manual = Number(manualUnapprovedLeaveDays || 0);

  const present_days = Math.max(0, workingDays - lop - hpl - other);
  const paid_days     = Math.max(0, workingDays - lop - (hpl * 0.5) - manual);

  return { present_days, paid_days, lop_days: lop, hpl_days: hpl, other_leave_days: other };
}

function round2(n) { return Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100; }

// Mirrors employee-salary-master.component.ts's arrear math exactly, recomputed here from the
// linked salary_increment_history row's stored snapshots/months/LOP-days rather than re-deriving
// it from anything client-supplied, so the PDF always reflects what was actually recorded.
const ARREAR_COMPONENT_FIELDS = [
  'basic_salary', 'dearness_allowance', 'city_allowance', 'hra',
  'conveyance', 'medical_allowance', 'travel_allowance', 'special_allowance'
];

function lopFactor(lopDays, months) {
  const totalDays = (Number(months) || 0) * 30;
  if (!totalDays) return 1;
  const lop = Math.max(0, Number(lopDays) || 0);
  return Math.max(0, Math.min(1, 1 - lop / totalDays));
}

// Returns null when this payment has no linked increment (nothing to break down), otherwise the
// full column-wise breakdown for both arrear buckets, same shape as the increment panel's table.
function computeArrearsBreakdown(sp) {
  const oldSnap = sp.old_salary_snapshot, newSnap = sp.new_salary_snapshot;
  if (!oldSnap || !newSnap) return null;

  const arrearMonths = Number(sp.arrear_months) || 0;
  const daArrearMonths = Number(sp.da_arrear_months) || 0;

  const standardDeltaSum = ARREAR_COMPONENT_FIELDS
    .reduce((sum, f) => sum + ((Number(newSnap[f]) || 0) - (Number(oldSnap[f]) || 0)), 0);
  const daDelta = (Number(newSnap.dearness_allowance) || 0) - (Number(oldSnap.dearness_allowance) || 0);
  const pfDelta = (Number(newSnap.pf_employee) || 0) - (Number(oldSnap.pf_employee) || 0);

  const standardLopFactor = lopFactor(sp.standard_lop_days, arrearMonths);
  const daLopFactorVal = lopFactor(sp.da_lop_days, daArrearMonths);

  const standardGrossRaw = round2(standardDeltaSum * arrearMonths);
  const daGrossRaw = round2(daDelta * daArrearMonths);

  const standardLopDeduction = round2(standardGrossRaw * (1 - standardLopFactor));
  const daLopDeduction = round2(daGrossRaw * (1 - daLopFactorVal));

  const standardGross = round2(standardGrossRaw - standardLopDeduction);
  const daGross = round2(daGrossRaw - daLopDeduction);

  const standardPfDeduction = round2(pfDelta * arrearMonths * standardLopFactor);
  const daPerMonthPf = round2(daDelta * 0.12);
  const daPfDeduction = round2(daPerMonthPf * daArrearMonths * daLopFactorVal);

  const standardNet = round2(standardGross - standardPfDeduction);
  const daNet = round2(daGross - daPfDeduction);

  return {
    arrearMonths, daArrearMonths,
    standardLopDays: Number(sp.standard_lop_days) || 0,
    daLopDays: Number(sp.da_lop_days) || 0,
    standardGrossRaw, daGrossRaw,
    standardLopDeduction, daLopDeduction,
    standardPfDeduction, daPfDeduction,
    standardNet, daNet,
    total: round2(standardNet + daNet),
  };
}

function buildArrearsBreakdownTable(b, fmt) {
  const row = (label, months, gross, lopDays, lopDeduction, pfDeduction, net) => `
    <tr>
      <td style="padding:6px 10px;border-bottom:1px solid #f0c36d;">${label}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #f0c36d;text-align:right;">${months}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #f0c36d;text-align:right;">${fmt(gross)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #f0c36d;text-align:right;">${lopDays}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #f0c36d;text-align:right;">- ${fmt(lopDeduction)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #f0c36d;text-align:right;">- ${fmt(pfDeduction)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #f0c36d;text-align:right;font-weight:bold;">${fmt(net)}</td>
    </tr>`;

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;
                font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7a4a00;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="padding:6px 10px;text-align:left;border-bottom:2px solid #f0c36d;">Arrear Window</th>
          <th style="padding:6px 10px;text-align:right;border-bottom:2px solid #f0c36d;">Months</th>
          <th style="padding:6px 10px;text-align:right;border-bottom:2px solid #f0c36d;">Gross</th>
          <th style="padding:6px 10px;text-align:right;border-bottom:2px solid #f0c36d;">LOP Days</th>
          <th style="padding:6px 10px;text-align:right;border-bottom:2px solid #f0c36d;">LOP Deduction</th>
          <th style="padding:6px 10px;text-align:right;border-bottom:2px solid #f0c36d;">PF (12%) Deduction</th>
          <th style="padding:6px 10px;text-align:right;border-bottom:2px solid #f0c36d;">Net</th>
        </tr>
      </thead>
      <tbody>
        ${row("Standard (Basic, HRA, City Allowance, Conveyance, Medical, Travel, Special &amp; DA)",
              b.arrearMonths, b.standardGrossRaw, b.standardLopDays, b.standardLopDeduction, b.standardPfDeduction, b.standardNet)}
        ${row("DA/PF backdate (1st April to before Effective From)",
              b.daArrearMonths, b.daGrossRaw, b.daLopDays, b.daLopDeduction, b.daPfDeduction, b.daNet)}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="6" style="padding:6px 10px;text-align:right;font-weight:bold;">Total Arrears</td>
          <td style="padding:6px 10px;text-align:right;font-weight:bold;">${fmt(b.total)}</td>
        </tr>
      </tfoot>
    </table>`;
}

// Injects a visible "Arrears Included" note and, when the linked increment's snapshots are
// available, a full column-wise breakdown table into the rendered slip HTML whenever this
// payment carries a positive arrears_amount - done here rather than via a mergeTemplate
// placeholder so it shows up regardless of whether the active PDF template was ever updated to
// reference one.
function insertArrearsBeforeRegdFooter(html, sp, fmt, monthLabel) {
  const arrears = Number(sp.arrears_amount) || 0;
  if (arrears <= 0) return html;

  const monthsLine = sp.arrear_months
    ? ` covering ${sp.arrear_months} month(s) of back pay from a salary increment`
    : " from a salary increment";
  const breakdown = computeArrearsBreakdown(sp);
  const note = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <tr>
        <td style="padding:12px 16px;background:#fff7e6;border:1px solid #f0c36d;border-radius:6px 6px 0 0;
                    font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7a4a00;">
          <strong>Arrears Included:</strong> This ${monthLabel} ${sp.payment_year} payment includes a
          one-time arrears amount of <strong>${fmt(arrears)}</strong>${monthsLine}, added on top of the
          regular Net Salary.
        </td>
      </tr>
      ${breakdown ? `
      <tr>
        <td style="padding:0 16px 12px;background:#fff7e6;border:1px solid #f0c36d;border-top:none;border-radius:0 0 6px 6px;">
          ${buildArrearsBreakdownTable(breakdown, fmt)}
        </td>
      </tr>` : ""}
    </table>`;

  // Land right before whichever of the two Regd. Office merge tags the template uses first, so
  // arrears reads above that footer instead of trailing after everything at the very end.
  const footerMarkerPattern = /\{\{\s*regd_office_line\s*\}\}|\{\{\s*regd_contact_line\s*\}\}/i;
  const match = html.match(footerMarkerPattern);
  if (match) {
    return html.slice(0, match.index) + note + html.slice(match.index);
  }
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, note + "</body>");
  }
  return html + note;
}

// PDF templates are user-authored plain HTML merged by simple {{tag}} substitution
// (mergeTemplate below) - any `*ngIf="x > 0"` attribute on a row is decorative only and never
// actually hides anything at render time. For merge tags that should genuinely disappear when
// there's nothing to show (LWF outside December, for one), the enclosing row is stripped from
// the raw template here, before merging, whenever the given value isn't greater than 0. Assumes
// the tag sits in a single flat row with no nested <div> between the row's opening tag and its
// closing </div> - true for every deduction/earning row in the default template.
function stripRowIfZero(html, mergeTag, value) {
  if (Number(value) > 0) return html;
  // The (?!<\/div>) guards stop the lazy [\s\S] from crossing an earlier sibling row's closing
  // tag, which would otherwise swallow that whole preceding row too - the div-open this starts
  // from must be the nearest one before the merge tag with no </div> in between.
  const rowPattern = new RegExp(
    `<div\\b[^>]*>(?:(?!<\\/div>)[\\s\\S])*?\\{\\{\\s*${mergeTag}\\s*\\}\\}(?:(?!<\\/div>)[\\s\\S])*?<\\/div>`,
    "i"
  );
  return html.replace(rowPattern, "");
}

// Rows to drop from the slip entirely when their underlying salary_payments column is 0 -
// field is the raw sp.* column (used for the >0 check), tag is the {{...}}_fmt merge tag whose
// row gets removed.
const ZERO_HIDE_MERGE_TAGS = [
  { field: "city_allowance",           tag: "city_allowance_fmt" },
  { field: "conveyance",               tag: "conveyance_fmt" },
  { field: "pf_employee",              tag: "pf_employee_fmt" },
  { field: "professional_tax",         tag: "professional_tax_fmt" },
  { field: "income_tax",               tag: "income_tax_fmt" },
  { field: "employee_state_insurance", tag: "employee_state_insurance_fmt" },
  { field: "loan_deduction",           tag: "loan_deduction_fmt" },
  { field: "other_deduction",          tag: "other_deduction_fmt" },
  { field: "lwf_amount",               tag: "lwf_amount_fmt" },
];

function clampRatio(paidDays, workingDays) {
  return workingDays > 0 ? Math.max(0, Math.min(1, paidDays / workingDays)) : 1;
}
const EARNING_KEYS = ['basic_salary','dearness_allowance','city_allowance','hra','conveyance','medical_allowance','travel_allowance','special_allowance','exgratia'];
// Prorates each earning line by ratio and sums the already-rounded lines for gross_salary,
// so an itemized earnings table always adds up exactly to the printed Gross Salary.
// When exgratiaOverride is given (an incentive was disbursed this month), it replaces the
// master's configured exgratia entirely and is paid in full, unprorated by attendance.
function prorateEarnings(master, ratio, exgratiaOverride) {
  const fields = {};
  let gross = 0;
  EARNING_KEYS.forEach(k => {
    const v = (k === 'exgratia' && exgratiaOverride != null) ? round2(Number(exgratiaOverride)) : round2(Number(master[k]) * ratio);
    fields[k] = v;
    gross += v;
  });
  return { fields, gross_salary: round2(gross) };
}

function calculateAge(dob) {
  if (!dob) return null;
  const dobDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - dobDate.getFullYear();
  const monthDiff = today.getMonth() - dobDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }
  return age;
}

// Professional Tax: Rs. 200/month, waived (0) when the standard monthly gross is under
// Rs. 25,000 OR the employee is over 60 - recomputed fresh at payroll time rather than trusted
// from whatever's stored on Employee Salary Master, since age crosses the 60 threshold silently
// over time without that record ever being re-saved.
// PT = flat Rs. 200/month, waived (0) if the employee's ACTUAL gross this month (after LOP/
// attendance proration) is under Rs. 25,000, or if they're over 60 - checked against what was
// actually paid, not the standard salary structure, so a heavy-LOP month can genuinely waive PT.
function computeProfessionalTax(actualMonthlyGross, dob) {
  if ((Number(actualMonthlyGross) || 0) < 25000) return 0;
  const age = calculateAge(dob);
  if (age != null && age > 60) return 0;
  return 200;
}

// ESI (Employee): 0.75% of the standard monthly gross when it's under Rs. 21,000, else 0 -
// same "recompute fresh, never trust the stored value" treatment as computeProfessionalTax.
// Eligibility (is this employee covered at all?) is checked against the standard, unprorated
// monthly gross - same basis as Employee Salary Master, so a LOP-heavy month can't flip someone
// in/out of ESI coverage. The deducted AMOUNT, once eligible, is 0.75% of the gross actually
// paid this month - like PF, it scales down with LOP/attendance instead of staying pinned to
// the full-month figure.
function computeEmployeeESI(standardMonthlyGross, actualMonthlyGross) {
  const standard = Number(standardMonthlyGross) || 0;
  const actual = Number(actualMonthlyGross ?? standardMonthlyGross) || 0;
  return standard < 21000 ? round2(actual * 0.0075) : 0;
}

exports.previewBulkPayroll = async function (payment_month, payment_year) {
  try {
    const query = `
      SELECT usd.id AS salary_detail_id, usd.user_id, CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS emp_name,
      um.dob,
      dm.name AS department_name, dm2.designation AS designation_name, usd.basic_salary, usd.dearness_allowance,
      usd.city_allowance, usd.hra, usd.conveyance, usd.medical_allowance, usd.travel_allowance, usd.special_allowance, usd.exgratia, usd.pf_employee,
      usd.professional_tax, usd.income_tax, usd.employee_state_insurance, usd.other_deduction, usd.pf_employer, usd.net_salary,
      usd.esi_employer, usd.gratuity, usd.gross_salary, usd.total_deductions,
      COALESCE((
        SELECT SUM(lar.monthly_deduction_amount)
        FROM loan_advance_request lar
        WHERE lar.employee_id = usd.user_id AND lar.status = 1 AND (lar.amount - lar.total_paid) > 0
      ), 0) AS monthly_deduction_amount,
        CASE
          WHEN sp.id IS NOT NULL THEN TRUE
          ELSE FALSE
        END AS already_processed,
        sp.id AS existing_payment_id, eid.amount AS incentive_amount,
        -- Aggregated (not a plain JOIN) so an employee with more than one increment scheduled
        -- into this same disbursement month still returns exactly one row here, combining every
        -- pending increment's arrears into a single total instead of duplicating the employee.
        COALESCE((
          SELECT SUM(sih.total_arrear_amount)
          FROM salary_increment_history sih
          WHERE sih.user_id = um.id AND sih.disbursement_month = :payment_month
            AND sih.disbursement_year = :payment_year AND sih.status = 1
            AND sih.is_reverted = FALSE AND sih.arrear_paid_status = 0
        ), 0) AS arrears_amount,
        (
          SELECT COALESCE(array_agg(sih.id), ARRAY[]::bigint[])
          FROM salary_increment_history sih
          WHERE sih.user_id = um.id AND sih.disbursement_month = :payment_month
            AND sih.disbursement_year = :payment_year AND sih.status = 1
            AND sih.is_reverted = FALSE AND sih.arrear_paid_status = 0
        ) AS increment_ids
      FROM users_salary_details usd
      LEFT JOIN users_master um ON um.id = usd.user_id
      LEFT JOIN department_master dm ON dm.id = um.department_id
      LEFT JOIN designation_master dm2 ON dm2.id  = um.designation_id
      LEFT JOIN salary_payments sp ON sp.salary_detail_id = usd.id
      AND sp.payment_month = :payment_month AND sp.payment_year = :payment_year
      AND sp.status = 1
      LEFT JOIN employee_incentive_details eid ON eid.employee_id = um.id and eid.disbursed_month_id = :payment_month and eid.status = 1
      WHERE usd.status = 1 AND um.status = TRUE
      ORDER BY dm.name, emp_name`;
    const [employees, monthInfo] = await Promise.all([
      sequelize.query(query, { replacements: { payment_month, payment_year }, type: QueryTypes.SELECT }),
      getMonthWorkingDays(payment_month, payment_year),
    ]);

    const userIds = employees.map(e => e.user_id).filter(Boolean);
    const leaveMap = userIds.length
      ? await OP_usersLeave.getLeaveDaysSummary(monthInfo.start_date, monthInfo.end_date, userIds)
      : {};

    const employeesWithAttendance = employees.map(emp => {
      const leave = emp.user_id ? leaveMap[emp.user_id] : null;
      const att = computeAttendance(monthInfo.working_days, leave, 0);
      const ratio = clampRatio(att.paid_days, monthInfo.working_days);
      const { fields, gross_salary } = prorateEarnings(emp, ratio, emp.incentive_amount);

      // Recompute Professional Tax fresh (gross threshold + age>60 waiver) against the ACTUAL
      // gross paid this month (gross_salary, after LOP/attendance proration) - corrected in
      // place before anything downstream (including the `master` snapshot below) reads
      // total_deductions/professional_tax, so every consumer of this row - preview totals, the
      // frontend's own recalculation on attendance/income-tax edits, and processBulkPayroll -
      // inherits the corrected baseline.
      const basePT = Number(emp.professional_tax) || 0;
      const ptOverride = computeProfessionalTax(gross_salary, emp.dob);
      if (ptOverride !== basePT) {
        emp.total_deductions = round2((Number(emp.total_deductions) || 0) - basePT + ptOverride);
        emp.professional_tax = ptOverride;
      }
      // Same fresh-recompute treatment for ESI (Employee) - eligibility off the standard gross
      // (emp.gross_salary, unprorated), deducted amount off the actual gross paid this month
      // (gross_salary, just prorated above).
      const baseESI = Number(emp.employee_state_insurance) || 0;
      const esiOverride = computeEmployeeESI(emp.gross_salary, gross_salary);
      if (esiOverride !== baseESI) {
        emp.total_deductions = round2((Number(emp.total_deductions) || 0) - baseESI + esiOverride);
        emp.employee_state_insurance = esiOverride;
      }
      // PF (Employee) is 12% of Basic+DA actually paid this month, not the full monthly figure -
      // LOP/attendance shortfalls that already prorated basic_salary/dearness_allowance down via
      // prorateEarnings above must prorate PF the same way, same treatment as PT/ESI above.
      const basePF = Number(emp.pf_employee) || 0;
      const pfOverride = round2(((Number(fields.basic_salary) || 0) + (Number(fields.dearness_allowance) || 0)) * 0.12);
      if (pfOverride !== basePF) {
        emp.total_deductions = round2((Number(emp.total_deductions) || 0) - basePF + pfOverride);
        emp.pf_employee = pfOverride;
      }
      // Active, unsettled loan/advance requests add their monthly installment on
      // top of whatever's manually entered in Employee Salary Master.
      const total_deductions = (Number(emp.total_deductions) || 0) + (Number(emp.monthly_deduction_amount) || 0);
      // A scheduled increment arrears lump sum (salary_increment_history.total_arrear_amount)
      // is paid in full, unprorated, on top of net salary - not part of gross_salary since
      // it's its own labeled payslip line rather than a recurring earning.
      const arrears_amount = round2(emp.arrears_amount);
      return {
        ...emp,
        ...fields,
        gross_salary,
        total_deductions,
        arrears_amount,
        net_salary:             round2(gross_salary - total_deductions + arrears_amount),
        master:                 { ...emp },
        working_days:          monthInfo.working_days,
        present_days:          att.present_days,
        paid_days:             att.paid_days,
        lop_days:              att.lop_days,
        hpl_days:              att.hpl_days,
        other_leave_days:      att.other_leave_days,
        unapproved_leave_days: 0,
      };
    });

    responseCodes.SUCCESS.data = { employees: employeesWithAttendance, monthInfo };
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Payroll Preview";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getLeaveSummary = async function (user_id, payment_month, payment_year) {
  try {
    const monthInfo = await getMonthWorkingDays(payment_month, payment_year);
    let leave = { lop_days: 0, hpl_days: 0, other_leave_days: 0 };
    if (user_id) {
      const map = await OP_usersLeave.getLeaveDaysSummary(monthInfo.start_date, monthInfo.end_date, [user_id]);
      leave = map[user_id] || leave;
    }
    const att = computeAttendance(monthInfo.working_days, leave, 0);
    responseCodes.SUCCESS.data = {
      working_days:     monthInfo.working_days,
      present_days:     att.present_days,
      paid_days:        att.paid_days,
      lop_days:         att.lop_days,
      hpl_days:         att.hpl_days,
      other_leave_days: att.other_leave_days,
    };
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Leave Summary";
    return responseCodes.BAD_REQUEST;
  }
};

exports.processBulkPayroll = async function (body) {
  const t = await sequelize.transaction();
  try {
    const { payment_month, payment_year, created_by, created_date, employees } = body;

    if (!Array.isArray(employees) || employees.length === 0) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "No employees selected";
      return responseCodes.BAD_REQUEST;
    }

    // Always recalculate working days server-side (excludes Sundays + mandatory holidays)
    const monthInfo = await getMonthWorkingDays(payment_month, payment_year);
    const calculatedWorkingDays = monthInfo.working_days;

    // Earnings/gross/net are never trusted from the client — refetch the master salary
    // structure fresh and recompute proration server-side, the same way working_days is.
    const salaryDetailIds = employees.map(e => e.salary_detail_id).filter(Boolean);
    const masterRows = salaryDetailIds.length
      ? await sequelize.query(
          `SELECT usd.id, usd.basic_salary, usd.dearness_allowance, usd.city_allowance, usd.hra, usd.conveyance,
                  usd.medical_allowance, usd.travel_allowance, usd.special_allowance, usd.exgratia, usd.total_deductions,
                  usd.pf_employee, usd.professional_tax, usd.income_tax, usd.employee_state_insurance,
                  usd.loan_deduction, usd.other_deduction, usd.pf_employer, usd.esi_employer, usd.gratuity,
                  um.dob,
                  COALESCE((
                    SELECT SUM(lar.monthly_deduction_amount)
                    FROM loan_advance_request lar
                    WHERE lar.employee_id = usd.user_id AND lar.status = 1 AND (lar.amount - lar.total_paid) > 0
                  ), 0) AS monthly_deduction_amount,
                  eid.amount AS incentive_amount,
                  -- Aggregated (not a plain JOIN) so an employee with more than one increment
                  -- scheduled into this same disbursement month is still one row here, combining
                  -- every pending increment's arrears instead of duplicating this master row.
                  COALESCE((
                    SELECT SUM(sih.total_arrear_amount)
                    FROM salary_increment_history sih
                    WHERE sih.user_id = usd.user_id AND sih.disbursement_month = :payment_month
                      AND sih.disbursement_year = :payment_year AND sih.status = 1
                      AND sih.is_reverted = FALSE AND sih.arrear_paid_status = 0
                  ), 0) AS arrears_amount,
                  (
                    SELECT COALESCE(array_agg(sih.id), ARRAY[]::bigint[])
                    FROM salary_increment_history sih
                    WHERE sih.user_id = usd.user_id AND sih.disbursement_month = :payment_month
                      AND sih.disbursement_year = :payment_year AND sih.status = 1
                      AND sih.is_reverted = FALSE AND sih.arrear_paid_status = 0
                  ) AS increment_ids
           FROM users_salary_details usd
           LEFT JOIN users_master um ON um.id = usd.user_id
           LEFT JOIN employee_incentive_details eid ON eid.employee_id = usd.user_id
             AND eid.disbursed_month_id = :payment_month AND eid.status = 1
           WHERE usd.id IN (:ids)`,
          { replacements: { ids: salaryDetailIds, payment_month, payment_year }, type: QueryTypes.SELECT, transaction: t }
        )
      : [];
    const masterMap = {};
    masterRows.forEach(m => { masterMap[m.id] = m; });

    const allConsumedIncrementIds = [];
    const records = employees.map(emp => {
      const master = masterMap[emp.salary_detail_id];

      const presentDays = emp.present_days != null ? Number(emp.present_days) : calculatedWorkingDays;
      const paidDaysRaw  = emp.paid_days    != null ? Number(emp.paid_days)    : calculatedWorkingDays;
      const paidDays = Math.max(0, Math.min(calculatedWorkingDays, paidDaysRaw));
      const ratio = clampRatio(paidDays, calculatedWorkingDays);

      let earningFields, deductionFields, gross_salary, total_deductions, net_salary;
      let arrears_amount = 0, increment_id = null, rowIncrementIds = [];
      // Labour Welfare Fund - entered manually by HR in the bulk preview (commonly only for the
      // December run, but not restricted here since state-wise LWF cycles vary); trusted as-is
      // from the client the same way income_tax already is, since there's no master value to
      // recompute it against.
      const lwfAmount = round2(emp.lwf_amount);
      if (master) {
        const prorated = prorateEarnings(master, ratio, master.incentive_amount);
        earningFields = prorated.fields;
        gross_salary  = prorated.gross_salary;
        // Active, unsettled loan/advance requests add their monthly installment on
        // top of whatever's manually entered in Employee Salary Master.
        const activeLoanDeduction = Number(master.monthly_deduction_amount) || 0;
        // Income Tax (TDS) is editable per row in the bulk preview for this run only - swap the
        // master's baked-in income_tax for whatever the client sent, same math as the frontend's
        // computeRowTotalDeductions, so the two never disagree.
        const baseIncomeTax = Number(master.income_tax) || 0;
        const incomeTaxOverride = emp.income_tax != null ? (Number(emp.income_tax) || 0) : baseIncomeTax;
        // Professional Tax is never trusted from Employee Salary Master either - recomputed
        // fresh against the ACTUAL gross paid this month (gross_salary, after LOP/attendance
        // proration) + current age, since both a heavy-LOP month and the 60 waiver threshold
        // can change PT without that record ever being re-saved.
        const standardGross = EARNING_KEYS.reduce((sum, k) => sum + (Number(master[k]) || 0), 0);
        const basePT = Number(master.professional_tax) || 0;
        const ptOverride = computeProfessionalTax(gross_salary, master.dob);
        // ESI (Employee) is editable per row in the bulk preview for this run only, same as
        // Income Tax - trust the client's value when they've touched it (emp.esi_touched),
        // otherwise auto-compute fresh: eligibility off the standard gross, deducted amount off
        // the actual gross paid this month (gross_salary, prorated).
        const baseESI = Number(master.employee_state_insurance) || 0;
        const esiOverride = emp.esi_touched
          ? (Number(emp.employee_state_insurance) || 0)
          : computeEmployeeESI(standardGross, gross_salary);
        // PF (Employee) is 12% of Basic+DA actually paid this month, not the full monthly
        // figure - LOP/attendance shortfalls already prorated basic_salary/dearness_allowance
        // down via prorateEarnings above, so PF has to follow the same ratio instead of staying
        // pinned to the master's full-month value.
        const basePF = Number(master.pf_employee) || 0;
        const pfOverride = round2(((Number(earningFields.basic_salary) || 0) + (Number(earningFields.dearness_allowance) || 0)) * 0.12);
        total_deductions = (Number(master.total_deductions) || 0) - baseIncomeTax + incomeTaxOverride
          - basePT + ptOverride - baseESI + esiOverride - basePF + pfOverride + activeLoanDeduction + lwfAmount;
        // A scheduled increment arrears lump sum is paid in full, unprorated, on top of
        // net salary - its own labeled payslip line, not part of gross_salary. There can be
        // more than one increment pending for the same disbursement month (see arrears_amount's
        // SUM above) - salary_payments.increment_id is a single FK, so it's only populated
        // when there's exactly one contributing increment; every id still gets its
        // arrear_paid_status flipped below regardless of how many there are.
        arrears_amount = round2(master.arrears_amount);
        rowIncrementIds = Array.isArray(master.increment_ids) ? master.increment_ids.filter(Boolean) : [];
        increment_id   = rowIncrementIds.length === 1 ? rowIncrementIds[0] : null;
        allConsumedIncrementIds.push(...rowIncrementIds);
        net_salary    = round2(gross_salary - total_deductions + arrears_amount);
        deductionFields = {
          pf_employee:              pfOverride,
          professional_tax:         ptOverride,
          income_tax:               incomeTaxOverride,
          employee_state_insurance: esiOverride,
          loan_deduction:           (Number(master.loan_deduction) || 0) + activeLoanDeduction,
          other_deduction:          Number(master.other_deduction)          || 0,
          pf_employer:              Number(master.pf_employer)              || 0,
          esi_employer:             Number(master.esi_employer)             || 0,
          gratuity:                 Number(master.gratuity)                 || 0,
        };
      } else {
        // No linked master record found (unexpected for bulk payroll — every row originates
        // from users_salary_details) — fall back to whatever the client sent as a last resort.
        earningFields = {};
        EARNING_KEYS.forEach(k => { earningFields[k] = Number(emp[k]) || 0; });
        gross_salary = Number(emp.gross_salary) || 0;
        total_deductions = Number(emp.total_deductions) || 0;
        net_salary = Number(emp.net_salary) || 0;
        deductionFields = {
          pf_employee:              Number(emp.pf_employee)              || 0,
          professional_tax:         Number(emp.professional_tax)         || 0,
          income_tax:               Number(emp.income_tax)               || 0,
          employee_state_insurance: Number(emp.employee_state_insurance) || 0,
          loan_deduction:           Number(emp.loan_deduction)           || 0,
          other_deduction:          Number(emp.other_deduction)          || 0,
          pf_employer:              Number(emp.pf_employer)              || 0,
          esi_employer:             Number(emp.esi_employer)             || 0,
          gratuity:                 Number(emp.gratuity)                 || 0,
        };
      }

      return {
        user_id:                  emp.user_id || null,
        salary_detail_id:         emp.salary_detail_id || null,
        payment_month,
        payment_year,
        ...earningFields,
        ...deductionFields,
        gross_salary,
        total_deductions,
        net_salary,
        arrears_amount,
        increment_id,
        lwf_amount:               lwfAmount,
        working_days:             calculatedWorkingDays,
        present_days:             presentDays,
        paid_days:                paidDays,
        unapproved_leave_days:    Number(emp.unapproved_leave_days) || 0,
        payment_status:           0,
        status:                   1,
        created_by,
        created_date,
      };
    });

    await salaryPayment.bulkCreate(records, { transaction: t });

    // Arrears just paid out in this run must never be picked up by a future run. Built from
    // every contributing increment id per row (allConsumedIncrementIds), not just each record's
    // single increment_id FK - a row can have more than one increment pending for the same
    // disbursement month, and every one of them still needs to be marked paid here.
    if (allConsumedIncrementIds.length) {
      await sequelize.query(
        `UPDATE salary_increment_history SET arrear_paid_status = 1 WHERE id IN (:ids)`,
        { replacements: { ids: allConsumedIncrementIds }, transaction: t }
      );
    }

    await t.commit();

    responseCodes.SUCCESS.data = { processed: records.length };
    responseCodes.SUCCESS.message = `Payroll generated for ${records.length} employee(s) successfully`;
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Process Bulk Payroll";
    return responseCodes.BAD_REQUEST;
  }
};

exports.generateSlip = async function (id) {
  const t = await sequelize.transaction();
  try {
    const query = `
      SELECT sp.*,
             CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS emp_name,
             um.mobile, um.email, um.doj, um.emp_code,
             dm.name        AS department_name,
             dm2.designation AS designation_name,
             TO_CHAR(TO_DATE(sp.payment_month::TEXT, 'MM'), 'Month') AS month_name,
             (SELECT doc_no FROM user_document_master WHERE user_id = sp.user_id AND doc_type = 'PAN'        AND status = 1 LIMIT 1) AS pan_no,
             (SELECT doc_no FROM user_document_master WHERE user_id = sp.user_id AND doc_type = 'UAN'        AND status = 1 LIMIT 1) AS uan_no,
             (SELECT doc_no FROM user_document_master WHERE user_id = sp.user_id AND doc_type = 'PF_ACCOUNT' AND status = 1 LIMIT 1) AS pf_account_no,
             (SELECT ubd.account_number FROM users_bank_details ubd WHERE ubd.user_id = sp.user_id AND ubd.is_active = true LIMIT 1) AS account_number,
             (SELECT bm.bank_name FROM users_bank_details ubd JOIN bank_master bm ON bm.id = ubd.bank_id WHERE ubd.user_id = sp.user_id AND ubd.is_active = true LIMIT 1) AS bank_name,
             cbm.client_name AS company_name,
             cbm.client_logo AS company_logo,
             olm.full_address AS company_address,
             city.name        AS company_city,
             state.name       AS company_state,
             olm.pincode      AS company_pincode,
             rolm.full_address AS regd_office_address,
             rolm.city         AS regd_office_city,
             rolm.state        AS regd_office_state,
             rolm.pincode      AS regd_office_pincode,
             rolm.phone        AS regd_office_phone,
             rolm.email        AS regd_office_email,
             sih.arrear_months AS arrear_months,
             sih.da_arrear_months AS da_arrear_months,
             sih.standard_lop_days AS standard_lop_days,
             sih.da_lop_days AS da_lop_days,
             sih.old_salary_snapshot AS old_salary_snapshot,
             sih.new_salary_snapshot AS new_salary_snapshot
      FROM salary_payments sp
      LEFT JOIN users_master           um    ON um.id    = sp.user_id
      LEFT JOIN department_master      dm    ON dm.id    = um.department_id
      LEFT JOIN designation_master     dm2   ON dm2.id   = um.designation_id
      LEFT JOIN salary_increment_history sih ON sih.id   = sp.increment_id
      LEFT JOIN client_branding_master cbm   ON cbm.id   = 1
      LEFT JOIN office_location_master olm   ON olm.id   = 1
      LEFT JOIN city_master            city  ON city.id  = olm.city_id
      LEFT JOIN state_master           state ON state.id = olm.state_id
      LEFT JOIN LATERAL (
        SELECT r.full_address, r.phone, r.email, r.pincode,
               rc.name AS city, rs.name AS state
        FROM office_location_master r
        LEFT JOIN city_master  rc ON rc.id = r.city_id
        LEFT JOIN state_master rs ON rs.id = r.state_id
        WHERE r.is_registered_office = true AND r.status = 1
        LIMIT 1
      ) rolm ON true
      WHERE sp.id = :id AND sp.status = 1
      LIMIT 1`;
    const rows = await sequelize.query(query, { replacements: { id }, type: QueryTypes.SELECT });
    if (!rows.length) {
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Salary payment record not found";
      return responseCodes.NOT_FOUND;
    }
    const sp = rows[0];

    const leaveBalanceRows = await sequelize.query(
      `SELECT ltm.leave_name, ulb.allocated_days, ulb.used_days, ulb.remaining_days
       FROM user_leave_balance ulb
       JOIN leave_type_master ltm ON ltm.id = ulb.leave_type_id
       WHERE ulb.user_id = :user_id AND ulb.status = 1
       ORDER BY ltm.leave_name ASC`,
      { replacements: { user_id: sp.user_id }, type: QueryTypes.SELECT }
    );

    const slipsDir = path.join(__dirname, "..", "public", "salary-slips");
    if (!fs.existsSync(slipsDir)) fs.mkdirSync(slipsDir, { recursive: true });

    const fileName = `slip_${id}.pdf`;
    const filePath = path.join(slipsDir, fileName);
    const slipUrl  = `/salary-slips/${fileName}`;

    // Resolve which template to render with: a payment that's already been
    // generated before keeps using the exact template version it was first
    // generated with, so editing/replacing the default afterwards can't
    // retroactively change an already-issued slip.
    let template = null;
    if (sp.pdf_template_id) {
      template = await pdfTemplateMaster.findOne({ where: { id: sp.pdf_template_id }, transaction: t });
    }
    if (!template) {
      template = await pdfTemplateMaster.findOne({
        where: { template_type: "salary_slip", is_default: true, is_active: 1 },
        transaction: t
      });
    }
    if (!template) {
      await t.rollback();
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "No active PDF template configured for Salary Slip — set one up in PDF Template Master.";
      return responseCodes.BAD_REQUEST;
    }

    const fmt = (n) => "Rs. " + (parseFloat(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
    const monthLabel = (sp.month_name || "").trim();
    const cityStatePin = [sp.company_city, sp.company_state].filter(Boolean).join(", ")
      + (sp.company_pincode ? ` - ${sp.company_pincode}` : "");
    const regdCityStatePin = [sp.regd_office_city, sp.regd_office_state].filter(Boolean).join(", ")
      + (sp.regd_office_pincode ? ` - ${sp.regd_office_pincode}` : "");
    const regdOfficeLine = sp.regd_office_address
      ? `Regd. Office: ${sp.regd_office_address}` + (regdCityStatePin ? `, ${regdCityStatePin}` : "")
      : "";
    const regdContactLine = [
      sp.regd_office_email ? `Email: ${sp.regd_office_email}` : null,
    ].filter(Boolean).join("   |   ");

    const mergeData = {
      company_name: sp.company_name || "ADVANCE CABLE TECHNOLOGIES LIMITED",
      company_logo_data_uri: getLogoDataUri(sp.company_logo),
      company_address: sp.company_address || "",
      company_city_state_pin: cityStatePin,
      month_name: monthLabel,
      payment_year: sp.payment_year,
      emp_code: sp.emp_code || "—",
      emp_name: sp.emp_name || "—",
      department_name: sp.department_name || "—",
      designation_name: sp.designation_name || "—",
      doj_formatted: sp.doj ? new Date(sp.doj).toLocaleDateString("en-IN") : "—",
      pan_no: sp.pan_no || "—",
      uan_no: sp.uan_no || "—",
      payment_status_label: sp.payment_status === 1 ? "Paid" : sp.payment_status === 2 ? "On Hold" : "Pending",
      payment_mode: sp.payment_mode || "—",
      payment_date_formatted: sp.payment_date ? new Date(sp.payment_date).toLocaleDateString("en-IN") : "—",
      pf_account_no: sp.pf_account_no || "—",
      bank_name: sp.bank_name || "—",
      account_number: sp.account_number || "—",
      remaining_days: leaveBalanceRows.length ? leaveBalanceRows[0].remaining_days : "—",
      working_days: sp.working_days ?? 0,
      present_days: sp.present_days ?? 0,
      paid_days: sp.paid_days ?? 0,
      basic_salary_fmt: fmt(sp.basic_salary),
      dearness_allowance_fmt: fmt(sp.dearness_allowance),
      city_allowance_fmt: fmt(sp.city_allowance),
      hra_fmt: fmt(sp.hra),
      conveyance_fmt: fmt(sp.conveyance),
      medical_allowance_fmt: fmt(sp.medical_allowance),
      travel_allowance_fmt: fmt(sp.travel_allowance),
      special_allowance_fmt: fmt(sp.special_allowance),
      exgratia_fmt: fmt(sp.exgratia),
      pf_employee_fmt: fmt(sp.pf_employee),
      professional_tax_fmt: fmt(sp.professional_tax),
      income_tax_fmt: fmt(sp.income_tax),
      employee_state_insurance_fmt: fmt(sp.employee_state_insurance),
      loan_deduction_fmt: fmt(sp.loan_deduction),
      other_deduction_fmt: fmt(sp.other_deduction),
      lwf_amount_fmt: fmt(sp.lwf_amount),
      gross_salary_fmt: fmt(sp.gross_salary),
      total_deductions_fmt: fmt(sp.total_deductions),
      arrears_amount_fmt: fmt(sp.arrears_amount),
      net_salary_fmt: fmt(sp.net_salary),
      regd_office_line: regdOfficeLine,
      regd_contact_line: regdContactLine,
      remarks_line: sp.remarks ? `Remarks: ${sp.remarks}` : "",
    };

    // Arrears only show up if the active template happens to reference {{arrears_amount_fmt}} -
    // templates are user-authored HTML with no such placeholder baked in today, so this note is
    // spliced directly into the raw template instead (before merging), guaranteeing it's visible
    // on every template whenever a payment actually carries arrears (arrears_amount > 0). It's
    // inserted right before the {{regd_office_line}}/{{regd_contact_line}} footer tags - wherever
    // the template places the Regd. Office address/phone/email - so arrears always read above
    // that footer instead of trailing after it at the very end of the document.
    let htmlWithArrears = insertArrearsBeforeRegdFooter(template.html_content, sp, fmt, monthLabel);
    // These rows are dropped entirely (not just printed as "Rs. 0.00") whenever nothing was
    // actually earned/deducted this payment - LWF only applies to the December run, and the rest
    // commonly land at 0 for plenty of employees (e.g. no active loan, PT/ESI waived by age or
    // gross, no City Allowance/Conveyance configured).
    ZERO_HIDE_MERGE_TAGS.forEach(({ tag, field }) => {
      htmlWithArrears = stripRowIfZero(htmlWithArrears, tag, sp[field]);
    });
    const mergedHtml = mergeTemplate(htmlWithArrears, mergeData);
    await renderHtmlToPdfFile(mergedHtml, filePath);

    await salaryPayment.update({ slip_url: slipUrl, pdf_template_id: template.id }, { where: { id }, transaction: t });
    await t.commit();

    responseCodes.SUCCESS.data = { slip_url: slipUrl };
    responseCodes.SUCCESS.message = "Salary slip generated successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to generate salary slip";
    return responseCodes.BAD_REQUEST;
  }
};

exports.emailSlip = async function (id, toEmail, sentBy, force) {
  const t0 = Date.now();
  const timings = {};
  const mark = (label, from) => { timings[label] = Date.now() - from; };
  let claimed = false;
  let sp, recipient, subject;
  try {
    // Fetch salary record
    const query = `
      SELECT sp.*,
             CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS emp_name,
             um.email AS emp_email,
             TO_CHAR(TO_DATE(sp.payment_month::TEXT, 'MM'), 'Month') AS month_name
      FROM salary_payments sp
      LEFT JOIN users_master um ON um.id = sp.user_id
      WHERE sp.id = :id AND sp.status = 1
      LIMIT 1`;
    let tStep = Date.now();
    const rows = await sequelize.query(query, { replacements: { id }, type: QueryTypes.SELECT });
    mark('fetchQuery', tStep);
    if (!rows.length) {
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Salary payment record not found";
      return responseCodes.NOT_FOUND;
    }
    sp = rows[0];

    // Resolve email — support array (multi-select) or single string, then fall back to employee record
    const resolved = Array.isArray(toEmail) ? toEmail.join(', ') : (toEmail || sp.emp_email);
    recipient = resolved;
    if (!recipient) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "No email address found for this employee";
      return responseCodes.BAD_REQUEST;
    }

    // Atomically claim this row before sending anything. sendMail can take 8-17s (Gmail SMTP) -
    // if we only set mail_status after sending, a second overlapping request for the same row
    // (double-click, overlapping bulk batches) reads mail_status=0 during that whole window and
    // sends a duplicate. The conditional WHERE makes the flip 0->1 atomic at the DB level, so
    // only one concurrent caller can ever win it; everyone else sees claimedCount === 0 and bails.
    // `force` lets HR deliberately resend a slip that's already gone out (single-row action only -
    // bulkEmailSlips never sets it, since it already pre-filters out mail_status===1 rows).
    tStep = Date.now();
    const [claimedCount] = await salaryPayment.update(
      { mail_status: 1, mail_sent_date: new Date() },
      { where: force ? { id } : { id, mail_status: { [Op.ne]: 1 } } }
    );
    mark('claim', tStep);
    if (claimedCount === 0) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "Salary slip email has already been sent (or is currently being sent) for this record";
      return responseCodes.BAD_REQUEST;
    }
    claimed = true;

    // Generate slip if not already done
    tStep = Date.now();
    if (!sp.slip_url) {
      const generated = await exports.generateSlip(id);
      if (generated.code !== "100") return generated;
      sp.slip_url = generated.data.slip_url;
    }

    const filePath = path.join(__dirname, "..", "public", sp.slip_url);
    if (!fs.existsSync(filePath)) {
      const generated = await exports.generateSlip(id);
      if (generated.code !== "100") return generated;
      sp.slip_url = generated.data.slip_url;
    }
    mark('generateSlip', tStep);

    const monthLabel = (sp.month_name || "").trim();
    subject = `Salary Slip — ${monthLabel} ${sp.payment_year}`;
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
                                Salary Slip
                            </p>
                        </td>
                      </tr>
                      <!-- Body -->
                      <tr>
                          <td style="padding:40px;">
                              <p style="font-size:16px;color:#333;margin-top:0;">Dear <strong>${sp.emp_name}</strong>,</p>
                              <p style="font-size:15px;color:#555;line-height:26px;">We hope you are doing well. </p>
                              <p style="font-size:15px;color:#555;line-height:26px;">Please find attached your <strong>Salary Slip</strong> for the month of <strong>${monthLabel} ${sp.payment_year}</strong>.</p>
                              <p style="font-size:15px;color:#555;line-height:26px;">Kindly keep this document for your records. If you have any questions or require any clarification regarding your salary slip, please contact the HR or Payroll Department.</p>
                              <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;">
                                  <tr>
                                      <td align="center">
                                          <div style="display:inline-block;background:#e8f4ff;border:1px solid #cfe2ff;padding:18px 25px;border-radius:8px;color:#0d6efd;font-size:15px;">
                                              📎 <strong>Your Salary Slip PDF is attached with this email.</strong>
                                          </div>
                                      </td>
                                  </tr>
                              </table>
                              <p style="font-size:15px;color:#555;line-height:26px;">Thank you for your continued dedication, hard work, and valuable contribution to the organization.</p>
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

    tStep = Date.now();
    await transporter.sendMail({
      from: process.env.EXP_HANDLE_USER_NAME || 'Advance Cable Technologies <tech@advancecable.in>',
      // to: 'tech@advancecable.in',
      to: recipient,
      subject,
      html,
      attachments: [
        {
          filename: `Salary_Slip_${monthLabel}_${sp.payment_year}.pdf`,
          path: path.join(__dirname, "..", "public", sp.slip_url),
        },
      ],
    });
    mark('sendMail', tStep);

    tStep = Date.now();
    await salarySlipMailLog.create({
      salary_payment_id: id,
      user_id: sp.user_id,
      recipient_email: recipient,
      subject,
      payment_month: sp.payment_month,
      payment_year: sp.payment_year,
      slip_url: sp.slip_url,
      status: 1,
      sent_by: sentBy || null,
      sent_date: new Date(),
    });
    mark('dbWrite', tStep);

    logger.info({ message: `emailSlip timing for id ${id}`, totalMs: Date.now() - t0, ...timings });
    responseCodes.SUCCESS.data = { sent_to: recipient };
    responseCodes.SUCCESS.message = `Salary slip sent to ${recipient}`;
    return responseCodes.SUCCESS;
  } catch (e) {
    // We claimed the row before sending - if the actual send failed, release the claim so
    // this row can be retried instead of being stuck showing "sent" when it wasn't, and record
    // the failed attempt for visibility in the mail log.
    if (claimed) {
      try {
        await salaryPayment.update({ mail_status: 0, mail_sent_date: null }, { where: { id } });
        await salarySlipMailLog.create({
          salary_payment_id: id,
          user_id: sp?.user_id,
          recipient_email: recipient || '',
          subject: subject || null,
          payment_month: sp?.payment_month,
          payment_year: sp?.payment_year,
          slip_url: sp?.slip_url || null,
          status: 0,
          sent_by: sentBy || null,
          sent_date: new Date(),
        });
      } catch (revertErr) {
        logger.error({ message: `emailSlip: failed to release claim for id ${id}`, error: revertErr.message });
      }
    }
    logger.error({ message: `emailSlip timing for id ${id} (failed)`, totalMs: Date.now() - t0, ...timings, error: e.message });
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to send salary slip email";
    return responseCodes.BAD_REQUEST;
  }
};

// How many slip emails to send concurrently. The SMTP transporter (Gmail) is pooled to
// this same size (see mailTransporterService.js) - keep the two in sync so sends actually
// overlap on the wire instead of queuing behind a smaller connection pool.
const BULK_EMAIL_CONCURRENCY = 5;

exports.bulkEmailSlips = async function (ids, sentBy) {
  const bulkT0 = Date.now();
  const rows = await salaryPayment.findAll({ where: { id: { [Op.in]: ids } }, attributes: ['id', 'mail_status'] });
  const skipped = rows.filter(r => r.mail_status === 1).map(r => r.id);
  const toSend = rows.filter(r => r.mail_status !== 1).map(r => r.id);

  const sent = [], failed = [];
  let batchNum = 0;
  for (let i = 0; i < toSend.length; i += BULK_EMAIL_CONCURRENCY) {
    batchNum++;
    const batchT0 = Date.now();
    const batch = toSend.slice(i, i + BULK_EMAIL_CONCURRENCY);
    const results = await Promise.all(batch.map(async (id) => {
      try {
        const res = await exports.emailSlip(id, null, sentBy);
        return res.code === '100' ? { id, ok: true } : { id, ok: false, reason: res.message };
      } catch (e) {
        return { id, ok: false, reason: e.message };
      }
    }));
    for (const r of results) {
      if (r.ok) sent.push(r.id);
      else failed.push({ id: r.id, reason: r.reason });
    }
    logger.info({ message: `bulkEmailSlips batch ${batchNum} timing`, batchSize: batch.length, batchMs: Date.now() - batchT0 });
  }
  logger.info({ message: 'bulkEmailSlips total timing', requested: ids.length, toSend: toSend.length, skipped: skipped.length, totalMs: Date.now() - bulkT0 });
  const data = { sent, failed, skipped };
  if (sent.length === 0 && toSend.length > 0) {
    responseCodes.BAD_REQUEST.data = data;
    responseCodes.BAD_REQUEST.message = `Failed to send all ${toSend.length} slip(s)`;
    return responseCodes.BAD_REQUEST;
  }
  responseCodes.SUCCESS.data = data;
  responseCodes.SUCCESS.message = `Sent ${sent.length} slip(s) successfully${failed.length ? `, ${failed.length} failed` : ''}${skipped.length ? `, ${skipped.length} already sent (skipped)` : ''}`;
  return responseCodes.SUCCESS;
};

exports.getDataByMonthYearPFDetails = async function (payment_month, payment_year) {
  try {
    const query = `
      WITH wage_calc AS (
        SELECT id,
               ROUND(basic_salary + dearness_allowance, 2) AS earned_wages,
               ROUND(CASE WHEN (basic_salary + dearness_allowance) >= 15001 THEN 15000
                          ELSE (basic_salary + dearness_allowance) END, 2) AS employer_deduction
        FROM salary_payments
      )
      SELECT sp.*,
             CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS emp_name,
             um.emp_code AS emp_code,
             dm.name  AS department_name,
             dm2.designation AS designation_name,
             (SELECT doc_no FROM user_document_master WHERE user_id = sp.user_id AND doc_type = 'UAN'        AND status = 1 LIMIT 1) AS uan_no,
             (SELECT doc_no FROM user_document_master WHERE user_id = sp.user_id AND doc_type = 'PF_ACCOUNT' AND status = 1 LIMIT 1) AS pf_account_no,
             wc.earned_wages,
             wc.employer_deduction,
             ROUND(wc.employer_deduction * 8.33 / 100, 2) AS employeer_pf,
             ROUND(sp.pf_employee - ROUND(wc.employer_deduction * 8.33 / 100, 2), 2) AS employeer_pension,
             ROUND(wc.employer_deduction * 3.67 / 100, 2) AS pension_employer
      FROM salary_payments sp
      JOIN wage_calc wc ON wc.id = sp.id
      LEFT JOIN users_master       um   ON um.id   = sp.user_id
      LEFT JOIN department_master  dm   ON dm.id   = um.department_id
      LEFT JOIN designation_master dm2  ON dm2.id  = um.designation_id
      WHERE sp.payment_month = :payment_month AND sp.payment_year  = :payment_year
      AND sp.status = 1 AND sp.payment_status = 1 AND sp.mail_status = 1 AND sp.pf_employee > 0
      ORDER BY sp.id ASC`;
    const data = await sequelize.query(query, {
      replacements: { payment_month, payment_year },
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Salary Payments";
    return responseCodes.BAD_REQUEST;
  }
};
exports.getDataByMonthYearESIDetails = async function (payment_month, payment_year) {
  try {
    const query = `
      SELECT sp.id, sp.user_id, sp.payment_month, sp.payment_year, sp.gross_salary, sp.working_days,
             sp.esi_paid_status,
             CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS emp_name,
             um.emp_code AS emp_code,
             ROUND(sp.gross_salary, 2) AS earned_wages,
             ROUND(sp.gross_salary * 0.75 / 100, 2) AS employee_state_insurance,
             ROUND(sp.gross_salary * 3.25 / 100, 2) AS esi_employer,
             (SELECT doc_no FROM user_document_master WHERE user_id = sp.user_id AND doc_type = 'ESI_No' AND status = 1 LIMIT 1) AS esi_no
      FROM salary_payments sp
      LEFT JOIN users_master um ON um.id = sp.user_id
      WHERE sp.payment_month = :payment_month AND sp.payment_year = :payment_year
      AND sp.gross_salary <= 21000
      AND sp.status = 1 AND sp.payment_status = 1 AND sp.mail_status = 1 AND sp.employee_state_insurance > 0
      ORDER BY sp.id ASC`;
    const data = await sequelize.query(query, {
      replacements: { payment_month, payment_year },
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Salary Payments";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getDataByMonthYearIncomeTaxDetails = async function (payment_month, payment_year) {
  try {
    const query = `
      SELECT sp.id, sp.user_id, sp.payment_month, sp.payment_year, sp.gross_salary, sp.working_days,
             sp.income_tax, sp.income_tax_paid_status,
             CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS emp_name,
             um.emp_code AS emp_code,
             ROUND(sp.gross_salary, 2) AS earned_wages,
             (SELECT doc_no FROM user_document_master WHERE user_id = sp.user_id AND doc_type = 'PAN' AND status = 1 LIMIT 1) AS pan_no
      FROM salary_payments sp
      LEFT JOIN users_master um ON um.id = sp.user_id
      WHERE sp.payment_month = :payment_month AND sp.payment_year = :payment_year
      AND sp.status = 1 AND sp.payment_status = 1 AND sp.mail_status = 1 AND sp.income_tax > 0
      ORDER BY sp.id ASC`;
    const data = await sequelize.query(query, {
      replacements: { payment_month, payment_year },
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Salary Payments";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getDataByMonthYearPTDetails = async function (payment_month, payment_year) {
  try {
    const query = `
      SELECT sp.id, sp.user_id, sp.payment_month, sp.payment_year, sp.gross_salary, sp.working_days,
             sp.professional_tax, sp.pt_paid_status,
             CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS emp_name,
             um.emp_code AS emp_code,
             ROUND(sp.gross_salary, 2) AS earned_wages
      FROM salary_payments sp
      LEFT JOIN users_master um ON um.id = sp.user_id
      WHERE sp.payment_month = :payment_month AND sp.payment_year = :payment_year
      AND sp.status = 1 AND sp.payment_status = 1 AND sp.mail_status = 1 AND sp.professional_tax > 0
      ORDER BY sp.id ASC`;
    const data = await sequelize.query(query, {
      replacements: { payment_month, payment_year },
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Salary Payments";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getDataPaymentCompleted = async function (user_id) {
  try {
    const query = `
      SELECT  SP.*,sp.payment_month, sp.payment_year,
      TO_CHAR(TO_DATE(sp.payment_month::TEXT, 'MM'), 'Month') AS month_name
      FROM salary_payments sp
      WHERE sp.status = 1 and sp.payment_status = 1 and user_id = ${user_id}
      ORDER BY sp.payment_month DESC`;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Distinct Months & Years";
    return responseCodes.BAD_REQUEST;
  }
}
