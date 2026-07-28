const { salaryPayment } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes, Op } = require("sequelize");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const transporter = require("../services/mailTransporterService");
const OP_usersLeave = require("./OP_usersLeave");

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
             TO_CHAR(TO_DATE(sp.payment_month::TEXT, 'MM'), 'Month') AS month_name
      FROM salary_payments sp
      LEFT JOIN users_master      um   ON um.id   = sp.user_id
      LEFT JOIN department_master dm   ON dm.id   = um.department_id
      LEFT JOIN designation_master dm2 ON dm2.id  = um.designation_id
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

  const daysInMonth = new Date(year, month, 0).getDate();

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
    working_days:    daysInMonth - sundaySet.size - nonSundayHolidays.length,
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
function clampRatio(paidDays, workingDays) {
  return workingDays > 0 ? Math.max(0, Math.min(1, paidDays / workingDays)) : 1;
}
const EARNING_KEYS = ['basic_salary','dearness_allowance','city_allowance','hra','conveyance','medical_allowance','travel_allowance','special_allowance','bonus'];
// Prorates each earning line by ratio and sums the already-rounded lines for gross_salary,
// so an itemized earnings table always adds up exactly to the printed Gross Salary.
function prorateEarnings(master, ratio) {
  const fields = {};
  let gross = 0;
  EARNING_KEYS.forEach(k => { const v = round2(Number(master[k]) * ratio); fields[k] = v; gross += v; });
  return { fields, gross_salary: round2(gross) };
}

exports.previewBulkPayroll = async function (payment_month, payment_year) {
  try {
    const query = `
      SELECT usd.id AS salary_detail_id, usd.user_id, CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS emp_name,
      dm.name AS department_name, dm2.designation AS designation_name, usd.basic_salary, usd.dearness_allowance,
      usd.city_allowance, usd.hra, usd.conveyance, usd.medical_allowance, usd.travel_allowance, usd.special_allowance, usd.bonus, usd.pf_employee,
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
        sp.id AS existing_payment_id
      FROM users_salary_details usd
      LEFT JOIN users_master um ON um.id = usd.user_id
      LEFT JOIN department_master dm ON dm.id = um.department_id
      LEFT JOIN designation_master dm2 ON dm2.id  = um.designation_id
      LEFT JOIN salary_payments sp ON sp.salary_detail_id = usd.id
      AND sp.payment_month = :payment_month AND sp.payment_year = :payment_year
      AND sp.status = 1
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
      const { fields, gross_salary } = prorateEarnings(emp, ratio);
      // Active, unsettled loan/advance requests add their monthly installment on
      // top of whatever's manually entered in Employee Salary Master.
      const total_deductions = (Number(emp.total_deductions) || 0) + (Number(emp.monthly_deduction_amount) || 0);
      return {
        ...emp,
        ...fields,
        gross_salary,
        total_deductions,
        net_salary:             round2(gross_salary - total_deductions),
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
                  usd.medical_allowance, usd.travel_allowance, usd.special_allowance, usd.bonus, usd.total_deductions,
                  usd.pf_employee, usd.professional_tax, usd.income_tax, usd.employee_state_insurance,
                  usd.loan_deduction, usd.other_deduction, usd.pf_employer, usd.esi_employer, usd.gratuity,
                  COALESCE((
                    SELECT SUM(lar.monthly_deduction_amount)
                    FROM loan_advance_request lar
                    WHERE lar.employee_id = usd.user_id AND lar.status = 1 AND (lar.amount - lar.total_paid) > 0
                  ), 0) AS monthly_deduction_amount
           FROM users_salary_details usd WHERE usd.id IN (:ids)`,
          { replacements: { ids: salaryDetailIds }, type: QueryTypes.SELECT, transaction: t }
        )
      : [];
    const masterMap = {};
    masterRows.forEach(m => { masterMap[m.id] = m; });

    const records = employees.map(emp => {
      const master = masterMap[emp.salary_detail_id];

      const presentDays = emp.present_days != null ? Number(emp.present_days) : calculatedWorkingDays;
      const paidDaysRaw  = emp.paid_days    != null ? Number(emp.paid_days)    : calculatedWorkingDays;
      const paidDays = Math.max(0, Math.min(calculatedWorkingDays, paidDaysRaw));
      const ratio = clampRatio(paidDays, calculatedWorkingDays);

      let earningFields, deductionFields, gross_salary, total_deductions, net_salary;
      if (master) {
        const prorated = prorateEarnings(master, ratio);
        earningFields = prorated.fields;
        gross_salary  = prorated.gross_salary;
        // Active, unsettled loan/advance requests add their monthly installment on
        // top of whatever's manually entered in Employee Salary Master.
        const activeLoanDeduction = Number(master.monthly_deduction_amount) || 0;
        total_deductions = (Number(master.total_deductions) || 0) + activeLoanDeduction;
        net_salary    = round2(gross_salary - total_deductions);
        deductionFields = {
          pf_employee:              Number(master.pf_employee)              || 0,
          professional_tax:         Number(master.professional_tax)         || 0,
          income_tax:               Number(master.income_tax)               || 0,
          employee_state_insurance: Number(master.employee_state_insurance) || 0,
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
             rolm.email        AS regd_office_email
      FROM salary_payments sp
      LEFT JOIN users_master           um    ON um.id    = sp.user_id
      LEFT JOIN department_master      dm    ON dm.id    = um.department_id
      LEFT JOIN designation_master     dm2   ON dm2.id   = um.designation_id
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
       WHERE ulb.user_id = :user_id AND ulb.year = :year AND ulb.status = 1
       ORDER BY ltm.leave_name ASC`,
      { replacements: { user_id: sp.user_id, year: sp.payment_year }, type: QueryTypes.SELECT }
    );

    const slipsDir = path.join(__dirname, "..", "public", "salary-slips");
    if (!fs.existsSync(slipsDir)) fs.mkdirSync(slipsDir, { recursive: true });

    const fileName = `slip_${id}.pdf`;
    const filePath = path.join(slipsDir, fileName);
    const slipUrl  = `/salary-slips/${fileName}`;

    await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const W = doc.page.width - 80; // usable width
      const L = 40;                  // left margin

      // ── Header ──────────────────────────────────────────────
      // Letterhead logo, if the client has uploaded one via Client Branding (pdfkit only
      // embeds JPEG/PNG — SVG/WEBP uploads are skipped rather than crashing slip generation).
      if (sp.company_logo && /\.(png|jpe?g)$/i.test(sp.company_logo)) {
        const logoPath = path.join(__dirname, "..", "public", sp.company_logo);
        if (fs.existsSync(logoPath)) {
          try {
            doc.image(logoPath, L, 36, { fit: [42, 42] });
          } catch (e) {
            // Corrupt/unsupported image data — fall back to text-only header.
          }
        }
      }

      doc.fontSize(18).font("Helvetica-Bold").fillColor("#1a3c5e")
         .text(sp.company_name || "ADVANCE CABLE TECHNOLOGIES LIMITED", L, 40, { align: "center", width: W });
      if (sp.company_address) {
        doc.fontSize(8).font("Helvetica").fillColor("#777777")
           .text(`Corp. Office: ${sp.company_address}`, L, doc.y + 2, { align: "center", width: W });
      }
      const cityStatePin = [sp.company_city, sp.company_state].filter(Boolean).join(", ")
        + (sp.company_pincode ? ` - ${sp.company_pincode}` : "");
      if (cityStatePin) {
        doc.fontSize(8).font("Helvetica").fillColor("#777777")
           .text(cityStatePin, L, doc.y + 1, { align: "center", width: W });
      }
      doc.fontSize(10).font("Helvetica").fillColor("#555555")
         .text("Pay Slip", L, doc.y + 2, { align: "center", width: W });

      doc.moveTo(L, doc.y + 8).lineTo(L + W, doc.y + 8).strokeColor("#1a3c5e").lineWidth(1.5).stroke();

      // ── Pay Period ───────────────────────────────────────────
      doc.y += 14;
      const monthLabel = (sp.month_name || "").trim();
      doc.fontSize(11).font("Helvetica-Bold").fillColor("#1a3c5e")
         .text(`Pay Period: ${monthLabel} ${sp.payment_year}`, L, doc.y, { align: "center", width: W });

      // ── Employee Info ────────────────────────────────────────
      doc.y += 12;
      doc.moveTo(L, doc.y).lineTo(L + W, doc.y).strokeColor("#cccccc").lineWidth(0.5).stroke();
      doc.y += 8;

      const col1 = L, col2 = L + W / 2;
      const infoY = doc.y;
      doc.fontSize(9).font("Helvetica-Bold").fillColor("#333333");

      const empInfo = [
        ["Employee Code",     sp.emp_code || "—"],
        ["Employee Name",   sp.emp_name || "—"],
        ["Department",      sp.department_name  || "—"],
        ["Designation",     sp.designation_name || "—"],
        ["Date of Joining", sp.doj ? new Date(sp.doj).toLocaleDateString("en-IN") : "—"],
        ["PAN No.",         sp.pan_no        || "—"],
        ["UAN No.",         sp.uan_no        || "—"],
        
      ];
      const payInfo = [
        ["Payment Status",  sp.payment_status === 1 ? "Paid" : sp.payment_status === 2 ? "On Hold" : "Pending"],
        ["Payment Mode",    sp.payment_mode || "—"],
        ["Payment Date",    sp.payment_date ? new Date(sp.payment_date).toLocaleDateString("en-IN") : "—"],
        ["PF Account No.",  sp.pf_account_no || "—"],
        ["Bank Name",       sp.bank_name       || "—"],
        ["Account No.",     sp.account_number  || "—"],
        ["Balance Leave",   leaveBalanceRows.length ? leaveBalanceRows[0].remaining_days : "—"],
      ];

      let ey = infoY;
      empInfo.forEach(([label, val]) => {
        doc.font("Helvetica-Bold").fillColor("#555555").fontSize(8).text(label + ":", col1, ey, { width: W / 2 - 10 });
        doc.font("Helvetica").fillColor("#111111").text(val, col1 + 110, ey, { width: W / 2 - 110 });
        ey += 16;
      });

      let py = infoY;
      payInfo.forEach(([label, val]) => {
        doc.font("Helvetica-Bold").fillColor("#555555").fontSize(8).text(label + ":", col2, py, { width: W / 2 - 10 });
        doc.font("Helvetica").fillColor("#111111").text(val, col2 + 110, py, { width: W / 2 - 110 });
        py += 16;
      });

      doc.y = Math.max(ey, py) + 8;

      // ── Attendance ───────────────────────────────────────────
      doc.moveTo(L, doc.y).lineTo(L + W, doc.y).strokeColor("#cccccc").lineWidth(0.5).stroke();
      doc.y += 8;
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#1a3c5e").text("Attendance", L, doc.y);
      doc.y += 6;

      const attCols = [["Working Days", sp.working_days], ["Present Days", sp.present_days], ["Paid Days", sp.paid_days]];
      const attW = W / 3;
      const attY = doc.y;
      attCols.forEach(([label, val], i) => {
        const x = L + i * attW;
        doc.roundedRect(x + 2, attY, attW - 8, 34, 4).fillAndStroke("#f0f4f8", "#d0dce8");
        doc.font("Helvetica-Bold").fontSize(8).fillColor("#555555").text(label, x + 6, attY + 5, { width: attW - 14 });
        doc.font("Helvetica-Bold").fontSize(13).fillColor("#1a3c5e").text(String(val ?? 0), x + 6, attY + 17, { width: attW - 14 });
      });
      doc.y = attY + 44;

      // ── Leave Balance ─────────────────────────────────────────
      // if (leaveBalanceRows.length) {
      //   doc.moveTo(L, doc.y).lineTo(L + W, doc.y).strokeColor("#cccccc").lineWidth(0.5).stroke();
      //   doc.y += 8;
      //   doc.font("Helvetica-Bold").fontSize(10).fillColor("#1a3c5e").text("Leave Balance", L, doc.y);
      //   doc.y += 6;

      //   const lbCols = [W * 0.40, W * 0.20, W * 0.20, W * 0.20];
      //   const lbHeaderY = doc.y;
      //   doc.rect(L, lbHeaderY, W, 16).fill("#2e6da4");
      //   let lx = L;
      //   ["Leave Type", "Allocated", "Used", "Remaining"].forEach((h, i) => {
      //     doc.font("Helvetica-Bold").fontSize(8).fillColor("#ffffff")
      //        .text(h, lx + 6, lbHeaderY + 4, { width: lbCols[i] - 6, align: i === 0 ? "left" : "right" });
      //     lx += lbCols[i];
      //   });

      //   let ly = lbHeaderY + 16;
      //   leaveBalanceRows.forEach((row, idx) => {
      //     const rowBg = idx % 2 === 0 ? "#f9fafb" : "#ffffff";
      //     doc.rect(L, ly, W, 16).fill(rowBg);
      //     let cx = L;
      //     [
      //       row.leave_name,
      //       Number(row.allocated_days ?? 0).toFixed(1),
      //       Number(row.used_days ?? 0).toFixed(1),
      //       Number(row.remaining_days ?? 0).toFixed(1),
      //     ].forEach((val, i) => {
      //       doc.font("Helvetica").fontSize(8).fillColor("#333333")
      //          .text(val, cx + 6, ly + 4, { width: lbCols[i] - 6, align: i === 0 ? "left" : "right" });
      //       cx += lbCols[i];
      //     });
      //     ly += 16;
      //   });
      //   doc.rect(L, lbHeaderY, W, ly - lbHeaderY).strokeColor("#d0dce8").lineWidth(0.5).stroke();
      //   doc.y = ly + 10;
      // }

      // ── Earnings & Deductions ────────────────────────────────
      const half = W / 2 - 4;
      const earnX = L, dedX = L + W / 2 + 4;
      const tableTop = doc.y;

      const fmt = (n) => "Rs. " + (parseFloat(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

      const earnings = [
        ["Basic Salary",        sp.basic_salary],
        ["Dearness Allowance",  sp.dearness_allowance],
        ["City Allowance",      sp.city_allowance],
        ["HRA",                 sp.hra],
        ["Conveyance",          sp.conveyance],
        ["Medical Allowance",   sp.medical_allowance],
        ["Travel Allowance",    sp.travel_allowance],
        ["Special Allowance",   sp.special_allowance],
        ["Bonus",               sp.bonus],
      ];
      const deductions = [
        ["PF (Employee)",       sp.pf_employee],
        ["Professional Tax",    sp.professional_tax],
        ["Income Tax (TDS)",    sp.income_tax],
        ["ESI (Employee)",      sp.employee_state_insurance],
        ["Loan / Advance",      sp.loan_deduction],
        ["Other Deductions",    sp.other_deduction],
      ];

      const drawTable = (title, rows, xStart, bgHeader) => {
        doc.rect(xStart, tableTop, half, 20).fill(bgHeader);
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff")
           .text(title, xStart + 6, tableTop + 6, { width: half - 6 });

        let ty = tableTop + 20;
        rows.forEach(([label, val], idx) => {
          const rowBg = idx % 2 === 0 ? "#f9fafb" : "#ffffff";
          doc.rect(xStart, ty, half, 16).fill(rowBg);
          doc.font("Helvetica").fontSize(8).fillColor("#333333")
             .text(label, xStart + 6, ty + 4, { width: half / 2 - 6 });
          doc.font("Helvetica").fontSize(8).fillColor("#111111")
             .text(fmt(val), xStart + half / 2, ty + 4, { width: half / 2 - 6, align: "right" });
          ty += 16;
        });
        doc.rect(xStart, tableTop, half, ty - tableTop).strokeColor("#d0dce8").lineWidth(0.5).stroke();
        return ty;
      };

      const earnEnd = drawTable("EARNINGS", earnings, earnX, "#2e6da4");
      drawTable("DEDUCTIONS", deductions, dedX, "#c0392b");

      doc.y = Math.max(earnEnd, tableTop + 20 + deductions.length * 16) + 10;

      // ── Employer Contributions ───────────────────────────────
      // const empContrib = [
      //   ["PF (Employer)", sp.pf_employer],
      //   ["ESI (Employer)", sp.esi_employer],
      //   ["Gratuity", sp.gratuity],
      // ];
      // const ecY = doc.y;
      // doc.rect(L, ecY, W, 20).fill("#1a3c5e");
      // doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff").text("EMPLOYER CONTRIBUTIONS", L + 6, ecY + 6, { width: W });
      // let ecRow = ecY + 20;
      // const ecColW = W / empContrib.length;
      // empContrib.forEach(([label, val], i) => {
      //   doc.rect(L + i * ecColW, ecRow, ecColW, 16).fill(i % 2 === 0 ? "#f9fafb" : "#ffffff");
      //   doc.font("Helvetica").fontSize(8).fillColor("#333333")
      //      .text(label, L + i * ecColW + 6, ecRow + 4, { width: ecColW / 2 - 6 });
      //   doc.font("Helvetica").fontSize(8).fillColor("#111111")
      //      .text(fmt(val), L + i * ecColW + ecColW / 2, ecRow + 4, { width: ecColW / 2 - 6, align: "right" });
      // });
      // doc.rect(L, ecY, W, 36).strokeColor("#d0dce8").lineWidth(0.5).stroke();
      // doc.y = ecRow + 24;

      // ── Summary ──────────────────────────────────────────────
      doc.y += 6;
      const summaryData = [
        ["Gross Salary",     sp.gross_salary,     "#2e6da4"],
        ["Total Deductions", sp.total_deductions,  "#c0392b"],
        ["Net Salary",       sp.net_salary,        "#1a7a4c"],
      ];
      const sW = W / 3;
      const summaryY = doc.y;
      summaryData.forEach(([label, val, color], i) => {
        const sx = L + i * sW;
        doc.roundedRect(sx + 2, summaryY, sW - 6, 44, 4).fillAndStroke(color, color);
        doc.font("Helvetica-Bold").fontSize(8).fillColor("#ffffff")
           .text(label, sx + 8, summaryY + 6, { width: sW - 14 });
        doc.font("Helvetica-Bold").fontSize(13).fillColor("#ffffff")
           .text(fmt(val), sx + 8, summaryY + 20, { width: sW - 14 });
      });
      doc.y = summaryY + 54;

      // ── Footer ───────────────────────────────────────────────
      doc.moveTo(L, doc.y).lineTo(L + W, doc.y).strokeColor("#cccccc").lineWidth(0.5).stroke();
      doc.y += 8;

      if (sp.regd_office_address) {
        const regdCityStatePin = [sp.regd_office_city, sp.regd_office_state].filter(Boolean).join(", ")
          + (sp.regd_office_pincode ? ` - ${sp.regd_office_pincode}` : "");
        const regdLine = `Regd. Office: ${sp.regd_office_address}` + (regdCityStatePin ? `, ${regdCityStatePin}` : "");
        doc.fontSize(7).font("Helvetica").fillColor("#999999")
           .text(regdLine, L, doc.y, { align: "center", width: W });
        doc.y += 10;
      }
      const regdContact = [
        sp.regd_office_phone ? `Phone: ${sp.regd_office_phone}` : null,
        sp.regd_office_email ? `Email: ${sp.regd_office_email}` : null,
      ].filter(Boolean).join("   |   ");
      if (regdContact) {
        doc.fontSize(7).font("Helvetica").fillColor("#999999")
           .text(regdContact, L, doc.y, { align: "center", width: W });
        doc.y += 10;
      }

      doc.fontSize(7).font("Helvetica").fillColor("#999999")
         .text("This is a system-generated salary slip. No signature required.", L, doc.y, { align: "center", width: W });
      if (sp.remarks) {
        doc.y += 10;
        doc.fontSize(8).font("Helvetica-Bold").fillColor("#555555").text("Remarks: ", L, doc.y, { continued: true });
        doc.font("Helvetica").fillColor("#333333").text(sp.remarks);
      }

      doc.end();
      stream.on("finish", resolve);
      stream.on("error",  reject);
    });

    await salaryPayment.update({ slip_url: slipUrl }, { where: { id }, transaction: t });
    await t.commit();

    responseCodes.SUCCESS.data = { slip_url: slipUrl };
    responseCodes.SUCCESS.message = "Salary slip generated successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e)
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to generate salary slip";
    return responseCodes.BAD_REQUEST;
  }
};

exports.emailSlip = async function (id, toEmail) {
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
    const rows = await sequelize.query(query, { replacements: { id }, type: QueryTypes.SELECT });
    if (!rows.length) {
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Salary payment record not found";
      return responseCodes.NOT_FOUND;
    }
    const sp = rows[0];

    // Resolve email — support array (multi-select) or single string, then fall back to employee record
    const resolved = Array.isArray(toEmail) ? toEmail.join(', ') : (toEmail || sp.emp_email);
    const recipient = resolved;
    console.log("Resolved recipient email:", recipient);
    if (!recipient) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "No email address found for this employee";
      return responseCodes.BAD_REQUEST;
    }

    // Generate slip if not already done
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

    const monthLabel = (sp.month_name || "").trim();
    const subject = `Salary Slip — ${monthLabel} ${sp.payment_year}`;
    const html = `
      <p>Dear ${sp.emp_name},</p>
      <p>Please find attached your salary slip for <strong>${monthLabel} ${sp.payment_year}</strong>.</p>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;">
        <tr><td style="color:#555;">Gross Salary</td><td><strong>₹ ${parseFloat(sp.gross_salary).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></td></tr>
        <tr><td style="color:#555;">Total Deductions</td><td><strong>₹ ${parseFloat(sp.total_deductions).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></td></tr>
        <tr style="background:#f0f8f0;"><td style="color:#1a7a4c;font-weight:bold;">Net Salary</td><td style="color:#1a7a4c;font-weight:bold;">₹ ${parseFloat(sp.net_salary).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>
      </table>
      <br/>
      <p style="color:#999;font-size:11px;">This is a system-generated email. Please do not reply.</p>
    `;

    await transporter.sendMail({
      from: process.env.EXP_HANDLE_USER_NAME || "no-reply@seeku.in",
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

    responseCodes.SUCCESS.data = { sent_to: recipient };
    responseCodes.SUCCESS.message = `Salary slip sent to ${recipient}`;
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to send salary slip email";
    return responseCodes.BAD_REQUEST;
  }
};

exports.bulkEmailSlips = async function (ids) {
  const sent = [], failed = [];
  for (const id of ids) {
    try {
      const res = await exports.emailSlip(id, null);
      if (res.code === '100') {
        sent.push(id);
      } else {
        failed.push({ id, reason: res.message });
      }
    } catch (e) {
      failed.push({ id, reason: e.message });
    }
  }
  const data = { sent, failed };
  if (sent.length === 0) {
    responseCodes.BAD_REQUEST.data = data;
    responseCodes.BAD_REQUEST.message = `Failed to send all ${ids.length} slip(s)`;
    return responseCodes.BAD_REQUEST;
  }
  responseCodes.SUCCESS.data = data;
  responseCodes.SUCCESS.message = `Sent ${sent.length} slip(s) successfully${failed.length ? `, ${failed.length} failed` : ''}`;
  return responseCodes.SUCCESS;
};

exports.getDataByMonthYear = async function (payment_month, payment_year) {
  try {
    const query = `
      SELECT sp.*,
             CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS emp_name,
             dm.name  AS department_name,
             dm2.designation AS designation_name
      FROM salary_payments sp
      LEFT JOIN users_master       um   ON um.id   = sp.user_id
      LEFT JOIN department_master  dm   ON dm.id   = um.department_id
      LEFT JOIN designation_master dm2  ON dm2.id  = um.designation_id
      WHERE sp.payment_month = :payment_month
        AND sp.payment_year  = :payment_year
        AND sp.status = 1
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
    console.log(e)
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Distinct Months & Years";
    return responseCodes.BAD_REQUEST;
  }
}
