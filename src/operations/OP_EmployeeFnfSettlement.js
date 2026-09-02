const { employeeFnfSettlement, usersMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

// Everything is computed off the employee's CURRENT active monthly salary row
// (users_salary_details, status=1, salary_type=1) - the only rate available at exit time.
async function loadCalculationInputs(user_id, last_working_day) {
  const userRows = await sequelize.query(
    `SELECT id, CONCAT(first_name, ' ', middle_name, ' ', last_name) AS emp_name, doj, emp_code
     FROM users_master WHERE id = :user_id`,
    { replacements: { user_id }, type: QueryTypes.SELECT }
  );
  if (!userRows.length) return null;
  const user = userRows[0];

  const salaryRows = await sequelize.query(
    `SELECT * FROM users_salary_details
     WHERE user_id = :user_id AND status = 1 AND salary_type = 1
     ORDER BY id DESC LIMIT 1`,
    { replacements: { user_id }, type: QueryTypes.SELECT }
  );
  const salary = salaryRows[0] || null;

  const lwd = new Date(last_working_day);
  const doj = user.doj ? new Date(user.doj) : null;
  const yearsOfService = doj
    ? Math.round(((lwd.getTime() - doj.getTime()) / (365.25 * 24 * 3600 * 1000)) * 100) / 100
    : 0;

  const grossMonthly = Number(salary?.gross_salary) || 0;
  // Same flat 30-day divisor this app already uses for LOP/arrear proration elsewhere
  // (salary-increment's LOP calculations) - kept consistent rather than using actual
  // days-in-month, which would make per-day rate vary month to month for no real reason.
  const perDayGross = Math.round((grossMonthly / 30) * 100) / 100;

  return { user, salary, lwd, doj, yearsOfService, perDayGross };
}

// Pending salary: days from the month AFTER the last actually-paid salary_payments row
// through last_working_day (inclusive) - "last processed month onward", not just the current
// calendar month, since payroll could be a month or more behind at exit time.
async function computePendingSalary(user_id, lwd, perDayGross) {
  const lastPaidRows = await sequelize.query(
    `SELECT payment_month, payment_year FROM salary_payments
     WHERE user_id = :user_id AND payment_status = 1 AND status = 1
     ORDER BY payment_year DESC, payment_month DESC LIMIT 1`,
    { replacements: { user_id }, type: QueryTypes.SELECT }
  );

  let pendingStart;
  if (lastPaidRows.length) {
    const { payment_month, payment_year } = lastPaidRows[0];
    pendingStart = new Date(payment_year, payment_month, 1); // month after the last paid one
  } else {
    pendingStart = new Date(lwd.getFullYear(), lwd.getMonth(), 1);
  }

  const msPerDay = 24 * 3600 * 1000;
  const pendingDays = Math.max(0, Math.round((lwd.getTime() - pendingStart.getTime()) / msPerDay) + 1);
  const amount = Math.round(pendingDays * perDayGross * 100) / 100;
  return { pending_salary_days: pendingDays, pending_salary_amount: amount };
}

// Every non-unpaid leave type's remaining balance, encashable at the current per-day gross
// rate - HR can uncheck individual leave types client-side before finalizing (leave_type_id
// list persisted in leave_encashment_breakdown), since not every company encashes every type.
async function computeLeaveEncashment(user_id, perDayGross) {
  const rows = await sequelize.query(
    `SELECT ulb.leave_type_id, ltm.leave_code, ltm.leave_name, ulb.remaining_days
     FROM user_leave_balance ulb
     JOIN leave_type_master ltm ON ltm.id = ulb.leave_type_id
     WHERE ulb.user_id = :user_id AND ulb.status = 1 AND ltm.is_unpaid = false
     ORDER BY ltm.leave_name`,
    { replacements: { user_id }, type: QueryTypes.SELECT }
  );
  return rows.map(r => {
    const days = Number(r.remaining_days) || 0;
    return {
      leave_type_id: r.leave_type_id,
      leave_code: r.leave_code,
      leave_name: r.leave_name,
      remaining_days: days,
      per_day_amount: perDayGross,
      encashable_amount: Math.round(days * perDayGross * 100) / 100,
      included: true,
    };
  });
}

// Payment of Gratuity Act: (15/26) x (Basic + DA) x years of service, only once tenure
// reaches 5 years - NOT the same as the "gratuity" CTC line item elsewhere in this app
// (a flat 5%-of-basic monthly accrual figure), which is unrelated to this statutory payout.
function computeGratuity(salary, yearsOfService) {
  const basicDA = (Number(salary?.basic_salary) || 0) + (Number(salary?.dearness_allowance) || 0);
  const eligible = yearsOfService >= 5;
  const amount = eligible ? Math.round(((15 / 26) * basicDA * yearsOfService) * 100) / 100 : 0;
  return { gratuity_eligible: eligible, gratuity_amount: amount, basic_da: Math.round(basicDA * 100) / 100 };
}

// Outstanding approved loans/advances (amount - total_paid > 0) - HR can uncheck individual
// loans client-side before finalizing, same as leave encashment above.
async function computeLoanRecovery(user_id) {
  const rows = await sequelize.query(
    `SELECT id, reason, amount, total_paid FROM loan_advance_request
     WHERE employee_id = :user_id AND status = 1 AND (amount - total_paid) > 0`,
    { replacements: { user_id }, type: QueryTypes.SELECT }
  );
  return rows.map(r => ({
    id: r.id,
    reason: r.reason,
    amount: Number(r.amount) || 0,
    total_paid: Number(r.total_paid) || 0,
    outstanding: Math.round((Number(r.amount) - Number(r.total_paid)) * 100) / 100,
    included: true,
  }));
}

exports.getFnfPreview = async function (body) {
  try {
    const { user_id, last_working_day, notice_period_required_days } = body;
    if (!user_id || !last_working_day) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "user_id and last_working_day are required";
      return responseCodes.BAD_REQUEST;
    }

    const inputs = await loadCalculationInputs(user_id, last_working_day);
    if (!inputs) {
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Employee not found";
      return responseCodes.NOT_FOUND;
    }
    const { user, salary, lwd, yearsOfService, perDayGross } = inputs;

    const pendingSalary = await computePendingSalary(user_id, lwd, perDayGross);
    const leaveBreakdown = await computeLeaveEncashment(user_id, perDayGross);
    const gratuity = computeGratuity(salary, yearsOfService);
    const loanBreakdown = await computeLoanRecovery(user_id);

    const requiredNoticeDays = Number(notice_period_required_days) || 0;

    responseCodes.SUCCESS.data = {
      user_id: user.id,
      emp_name: user.emp_name,
      emp_code: user.emp_code,
      doj: user.doj,
      last_working_day,
      years_of_service: yearsOfService,
      salary_detail_id: salary?.id || null,
      per_day_gross: perDayGross,
      pending_salary: pendingSalary,
      leave_encashment_breakdown: leaveBreakdown,
      leave_encashment_amount: Math.round(leaveBreakdown.reduce((s, l) => s + l.encashable_amount, 0) * 100) / 100,
      gratuity,
      loan_recovery_breakdown: loanBreakdown,
      loan_recovery_amount: Math.round(loanBreakdown.reduce((s, l) => s + l.outstanding, 0) * 100) / 100,
      notice_period_required_days: requiredNoticeDays,
    };
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Calculate FNF Preview";
    return responseCodes.BAD_REQUEST;
  }
};

// Saves a settlement as a Draft (status 0) - HR can reopen and recalculate/edit before
// finalizing. The client sends the same shape getFnfPreview returns, plus notice_period_served_days,
// other_additions/deductions, remarks, and which leave/loan breakdown rows are `included`
// (only included rows count toward the totals below).
exports.saveDraft = async function (body) {
  const t = await sequelize.transaction();
  try {
    const totals = computeTotals(body);
    const data = buildRowData(body, totals, 0);

    let result;
    if (body.id) {
      await employeeFnfSettlement.update(data, { where: { id: body.id }, transaction: t });
      result = { id: body.id };
    } else {
      result = await employeeFnfSettlement.create(data, { transaction: t });
    }
    await t.commit();
    responseCodes.SUCCESS.data = { id: result.id, ...totals };
    responseCodes.SUCCESS.message = "Settlement saved as draft";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Save Settlement Draft";
    return responseCodes.BAD_REQUEST;
  }
};

// Finalizes the settlement (status 1) and marks the employee exited (users_master.status =
// false) - the same signal the HR dashboard's attrition-rate/headcount-trend widgets already
// read off status+modified_date, so a finalized FNF immediately reflects there too.
exports.finalize = async function (body) {
  const t = await sequelize.transaction();
  try {
    const totals = computeTotals(body);
    const data = buildRowData(body, totals, 1);
    data.finalized_by = body.modified_by;
    data.finalized_date = body.modified_date;

    let settlementId = body.id;
    if (settlementId) {
      await employeeFnfSettlement.update(data, { where: { id: settlementId }, transaction: t });
    } else {
      const created = await employeeFnfSettlement.create(data, { transaction: t });
      settlementId = created.id;
    }

    await usersMaster.update(
      { status: false, modified_by: body.modified_by, modified_date: body.modified_date },
      { where: { id: body.user_id }, transaction: t }
    );

    await t.commit();
    responseCodes.SUCCESS.data = { id: settlementId, ...totals };
    responseCodes.SUCCESS.message = "Settlement finalized and employee marked as exited";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Finalize Settlement";
    return responseCodes.BAD_REQUEST;
  }
};

// Net payable = (pending salary + leave encashment + gratuity + other additions)
// - (loan recovery + notice shortfall + other deductions). Only `included` breakdown rows
// count, so an HR-unchecked leave type or loan doesn't factor into the totals.
function computeTotals(body) {
  const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

  const leaveAmount = round2(
    (body.leave_encashment_breakdown || []).filter(l => l.included !== false)
      .reduce((s, l) => s + (Number(l.encashable_amount) || 0), 0)
  );
  const loanAmount = round2(
    (body.loan_recovery_breakdown || []).filter(l => l.included !== false)
      .reduce((s, l) => s + (Number(l.outstanding) || 0), 0)
  );

  const requiredDays = Number(body.notice_period_required_days) || 0;
  const servedDays = Number(body.notice_period_served_days) || 0;
  const shortfallDays = Math.max(0, requiredDays - servedDays);
  const noticeShortfallAmount = round2(shortfallDays * (Number(body.per_day_gross) || 0));

  const pendingSalaryAmount = round2(body.pending_salary?.pending_salary_amount);
  const gratuityAmount = round2(body.gratuity?.gratuity_amount);
  const otherAdditions = round2(body.other_additions);
  const otherDeductions = round2(body.other_deductions);

  const grossEarnings = round2(pendingSalaryAmount + leaveAmount + gratuityAmount + otherAdditions);
  const totalDeductions = round2(loanAmount + noticeShortfallAmount + otherDeductions);
  const netPayable = round2(grossEarnings - totalDeductions);

  return {
    pending_salary_amount: pendingSalaryAmount,
    leave_encashment_amount: leaveAmount,
    gratuity_amount: gratuityAmount,
    loan_recovery_amount: loanAmount,
    notice_shortfall_amount: noticeShortfallAmount,
    other_additions: otherAdditions,
    other_deductions: otherDeductions,
    gross_earnings: grossEarnings,
    total_deductions: totalDeductions,
    net_payable: netPayable,
  };
}

function buildRowData(body, totals, status) {
  return {
    user_id: body.user_id,
    salary_detail_id: body.salary_detail_id || null,
    last_working_day: body.last_working_day,
    years_of_service: body.years_of_service || 0,
    pending_salary_days: body.pending_salary?.pending_salary_days || 0,
    pending_salary_amount: totals.pending_salary_amount,
    leave_encashment_breakdown: body.leave_encashment_breakdown || [],
    leave_encashment_amount: totals.leave_encashment_amount,
    gratuity_eligible: !!body.gratuity?.gratuity_eligible,
    gratuity_amount: totals.gratuity_amount,
    loan_recovery_breakdown: body.loan_recovery_breakdown || [],
    loan_recovery_amount: totals.loan_recovery_amount,
    notice_period_required_days: body.notice_period_required_days || 0,
    notice_period_served_days: body.notice_period_served_days || 0,
    notice_shortfall_amount: totals.notice_shortfall_amount,
    other_additions: totals.other_additions,
    other_deductions: totals.other_deductions,
    remarks: body.remarks || null,
    gross_earnings: totals.gross_earnings,
    total_deductions: totals.total_deductions,
    net_payable: totals.net_payable,
    status,
    created_by: body.id ? undefined : body.modified_by,
    created_date: body.id ? undefined : body.modified_date,
    modified_by: body.modified_by,
    modified_date: body.modified_date,
  };
}

exports.getByUser = async function (user_id) {
  try {
    const data = await sequelize.query(
      `SELECT * FROM employee_fnf_settlement WHERE user_id = :user_id ORDER BY id DESC`,
      { replacements: { user_id }, type: QueryTypes.SELECT }
    );
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Settlement History";
    return responseCodes.BAD_REQUEST;
  }
};
