const { usersSalaryDetails, salaryIncrementHistory } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes, Op } = require("sequelize");

// Fields whose value depends on salary_type (Monthly x 12 <-> Yearly / 12)
const AMOUNT_FIELDS = [
  "ctc", "basic_salary", "dearness_allowance", "city_allowance", "hra",
  "conveyance", "medical_allowance", "travel_allowance", "special_allowance", "bonus",
  "pf_employee", "professional_tax", "income_tax", "employee_state_insurance",
  "loan_deduction", "other_deduction", "pf_employer", "esi_employer",
  "gratuity", "gross_salary", "total_deductions", "net_salary",
];

// Fields carried over as-is to the auto-generated counterpart row
const SHARED_FIELDS = ["user_id", "effective_from", "pay_frequency", "tax_regime"];

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

// Builds the opposite-type (Monthly<->Yearly) counterpart row from a saved salary record
function buildCounterpart(source) {
  const toYearly = Number(source.salary_type) !== 2;
  const counterpart = { salary_type: toYearly ? 2 : 1 };

  SHARED_FIELDS.forEach((field) => {
    counterpart[field] = source[field];
  });

  AMOUNT_FIELDS.forEach((field) => {
    const value = Number(source[field]) || 0;
    counterpart[field] = toYearly ? round2(value * 12) : round2(value / 12);
  });

  if (source.created_by !== undefined) counterpart.created_by = source.created_by;
  if (source.created_date !== undefined) counterpart.created_date = source.created_date;
  if (source.modified_by !== undefined) counterpart.modified_by = source.modified_by;
  if (source.modified_date !== undefined) counterpart.modified_date = source.modified_date;

  return counterpart;
}

exports.addData = async function (body) {
  const t = await sequelize.transaction();
  try {
    const primary = await usersSalaryDetails.create(body.data, {
      transaction: t,
    });
    // const counterpart = await usersSalaryDetails.create(
    //   buildCounterpart(primary.get({ plain: true })),
    //   { transaction: t }
    // );
    // await primary.update({ pair_id: counterpart.id }, { transaction: t });
    // await counterpart.update({ pair_id: primary.id }, { transaction: t });
    await t.commit();
    responseCodes.SUCCESS.data = primary.id;
    responseCodes.SUCCESS.message = "Salary Added Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Salary";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateData = async function (body) {
  const t = await sequelize.transaction();
  try {
    await usersSalaryDetails.update(body.data, {
      where: { id: body.id },
      transaction: t,
    });
    const primary = await usersSalaryDetails.findByPk(body.id, { transaction: t });
    if (primary && primary.pair_id) {
      await usersSalaryDetails.update(
        buildCounterpart(primary.get({ plain: true })),
        { where: { id: primary.pair_id }, transaction: t }
      );
    }
    await t.commit();
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Salary Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Salary";
    return responseCodes.BAD_REQUEST;
  }
};

// Applies an increment given from Employee Salary Master's "Give Increment" action: snapshots
// the row's full current field set into salary_increment_history (append-only, so it survives
// the in-place overwrite below), then saves body.data's salary fields as the new current row -
// same trust model as updateData (the frontend already computed the new values), just with an
// archived-before-write step. increment_type/value/disbursement_month/disbursement_year/remarks
// describe the change and are stored on the history row only, never written to
// users_salary_details itself.
exports.applyIncrement = async function (body) {
  const t = await sequelize.transaction();
  try {
    const primary = await usersSalaryDetails.findByPk(body.id, { transaction: t });
    if (!primary) {
      await t.rollback();
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Salary record not found";
      return responseCodes.NOT_FOUND;
    }
    const oldPlain = primary.get({ plain: true });
    const oldSnapshot = {};
    AMOUNT_FIELDS.forEach((f) => { oldSnapshot[f] = oldPlain[f]; });

    const data = body.data || {};
    const {
      increment_type, increment_value, disbursement_month, disbursement_year,
      arrear_months, da_arrear_months, standard_lop_days, da_lop_days, total_arrear_amount,
      standard_arrear_amount, da_arrear_amount, component_arrear_amounts,
      remarks, modified_by, modified_date,
      ...salaryFields
    } = data;

    await usersSalaryDetails.update(salaryFields, { where: { id: body.id }, transaction: t });

    const updated = await usersSalaryDetails.findByPk(body.id, { transaction: t });
    const updatedPlain = updated.get({ plain: true });
    if (updatedPlain.pair_id) {
      await usersSalaryDetails.update(
        buildCounterpart(updatedPlain),
        { where: { id: updatedPlain.pair_id }, transaction: t }
      );
    }

    const newSnapshot = {};
    AMOUNT_FIELDS.forEach((f) => { newSnapshot[f] = updatedPlain[f]; });

    await salaryIncrementHistory.create(
      {
        user_id: oldPlain.user_id,
        salary_detail_id: body.id,
        increment_type,
        increment_value,
        effective_from: salaryFields.effective_from ?? oldPlain.effective_from,
        disbursement_month,
        disbursement_year,
        arrear_months: arrear_months || 0,
        da_arrear_months: da_arrear_months || 0,
        standard_lop_days: standard_lop_days || 0,
        da_lop_days: da_lop_days || 0,
        total_arrear_amount: total_arrear_amount || 0,
        standard_arrear_amount: standard_arrear_amount || 0,
        da_arrear_amount: da_arrear_amount || 0,
        component_arrear_amounts: component_arrear_amounts || null,
        old_salary_snapshot: oldSnapshot,
        new_salary_snapshot: newSnapshot,
        remarks: remarks || null,
        status: 1,
        created_by: modified_by,
        created_date: modified_date,
      },
      { transaction: t }
    );

    await t.commit();
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Increment Applied Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Apply Increment";
    return responseCodes.BAD_REQUEST;
  }
};

// Rolls users_salary_details (and its Monthly<->Yearly pair) back to a history row's
// old_salary_snapshot - undoing exactly what applyIncrement saved as the new current salary.
// Refuses to revert a row that isn't the LATEST non-reverted increment on that salary_detail_id,
// since reverting to an older snapshot while a later increment sits on top of it would silently
// discard that later increment's change; the history row itself stays (marked is_reverted)
// rather than being deleted, so the audit trail still shows the increment happened.
exports.revertIncrement = async function (body) {
  const t = await sequelize.transaction();
  try {
    const history = await salaryIncrementHistory.findByPk(body.id, { transaction: t });
    if (!history) {
      await t.rollback();
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Increment history record not found";
      return responseCodes.NOT_FOUND;
    }
    const historyPlain = history.get({ plain: true });

    if (historyPlain.is_reverted) {
      await t.rollback();
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "This increment has already been reverted";
      return responseCodes.BAD_REQUEST;
    }

    const newer = await salaryIncrementHistory.findOne({
      where: {
        salary_detail_id: historyPlain.salary_detail_id,
        status: 1,
        is_reverted: false,
        id: { [Op.gt]: historyPlain.id },
      },
      transaction: t,
    });
    if (newer) {
      await t.rollback();
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "A newer increment exists on top of this one - revert that first.";
      return responseCodes.BAD_REQUEST;
    }

    const primary = await usersSalaryDetails.findByPk(historyPlain.salary_detail_id, { transaction: t });
    if (!primary) {
      await t.rollback();
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Salary record not found";
      return responseCodes.NOT_FOUND;
    }

    const restoreFields = {};
    AMOUNT_FIELDS.forEach((f) => { restoreFields[f] = historyPlain.old_salary_snapshot[f]; });

    await usersSalaryDetails.update(restoreFields, { where: { id: primary.id }, transaction: t });

    const updated = await usersSalaryDetails.findByPk(primary.id, { transaction: t });
    const updatedPlain = updated.get({ plain: true });
    if (updatedPlain.pair_id) {
      await usersSalaryDetails.update(
        buildCounterpart(updatedPlain),
        { where: { id: updatedPlain.pair_id }, transaction: t }
      );
    }

    await salaryIncrementHistory.update(
      {
        is_reverted: true,
        reverted_by: body.reverted_by,
        reverted_date: body.reverted_date,
      },
      { where: { id: historyPlain.id }, transaction: t }
    );

    await t.commit();
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Increment Reverted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Revert Increment";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  const t = await sequelize.transaction();
  try {
    const primary = await usersSalaryDetails.findByPk(body.id, { transaction: t });
    await usersSalaryDetails.update(body.data, {
      where: { id: body.id },
      transaction: t,
    });
    if (primary && primary.pair_id) {
      await usersSalaryDetails.update(body.data, {
        where: { id: primary.pair_id },
        transaction: t,
      });
    }
    await t.commit();
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Salary Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Salary";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getAllData = async function (body) {
  try {
    const query = `
      SELECT usd.*,
             CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS emp_name,
             um.dob,
             lih.mail_status AS latest_increment_mail_status,
             lih.increment_type AS latest_increment_type,
             lih.increment_value AS latest_increment_value,
             lih.effective_from AS latest_increment_effective_from,
             lih.disbursement_month_name AS latest_disbursement_month_name,
             lih.disbursement_year AS latest_disbursement_year,
             lih.arrear_months AS latest_arrear_months,
             lih.da_arrear_months AS latest_da_arrear_months,
             lih.standard_lop_days AS latest_standard_lop_days,
             lih.da_lop_days AS latest_da_lop_days,
             lih.total_arrear_amount AS latest_total_arrear_amount,
             lih.standard_arrear_amount AS latest_standard_arrear_amount,
             lih.da_arrear_amount AS latest_da_arrear_amount,
             lih.component_arrear_amounts AS latest_component_arrear_amounts,
             lih.is_reverted AS latest_increment_reverted,
             lih.created_date AS latest_increment_date
      FROM users_salary_details usd
      LEFT JOIN users_master um ON um.id = usd.user_id
      LEFT JOIN LATERAL (
        SELECT sih.mail_status, sih.increment_type, sih.increment_value, sih.effective_from,
               sih.disbursement_year, sih.arrear_months, sih.da_arrear_months,
               sih.standard_lop_days, sih.da_lop_days, sih.total_arrear_amount,
               sih.standard_arrear_amount, sih.da_arrear_amount, sih.component_arrear_amounts,
               sih.is_reverted, sih.created_date,
               CASE WHEN sih.disbursement_month IS NOT NULL
                    THEN TRIM(TO_CHAR(TO_DATE(sih.disbursement_month::TEXT, 'MM'), 'Month'))
                    ELSE NULL END AS disbursement_month_name
        FROM salary_increment_history sih
        WHERE sih.user_id = usd.user_id AND sih.status = 1
        ORDER BY sih.id DESC
        LIMIT 1
      ) lih ON true
      WHERE usd.status = 1
      ORDER BY usd.id DESC`;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Salary Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getOneData = async function (id) {
  try {
    const query = `
      SELECT usd.*,
             CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS emp_name,
             um.mobile, um.email, um.doj, um.dob,
             dm.name  AS department_name,
             dm2.designation AS designation_name
      FROM users_salary_details usd
      LEFT JOIN users_master     um  ON um.id  = usd.user_id
      LEFT JOIN department_master dm  ON dm.id  = um.department_id
      LEFT JOIN designation_master dm2 ON dm2.id = um.designation_id
      WHERE usd.id = :id AND usd.status = 1
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
    responseCodes.BAD_REQUEST.message = "Failed to Load Salary Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getDataByUserId = async function (user_id) {
  try {
    const query = `
      SELECT usd.*,
             CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS emp_name,
             um.dob
      FROM users_salary_details usd
      LEFT JOIN users_master um ON um.id = usd.user_id
      WHERE usd.user_id = :user_id AND usd.status = 1
      ORDER BY usd.id DESC`;
    const data = await sequelize.query(query, {
      replacements: { user_id },
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Salary Data";
    return responseCodes.BAD_REQUEST;
  }
};

// Total net salary (monthly rows only - salary_type = 1) grouped by department or
// designation, for the HR dashboard's "Salary by Department/Designation" widget.
exports.getGroupedSalary = async function (groupBy) {
  try {
    const groupExpr = groupBy === 'designation' ? 'dm2.designation' : 'dm.name';
    const query = `
      SELECT COALESCE(${groupExpr}, 'Unassigned') AS label,
             COUNT(DISTINCT usd.user_id) AS employee_count,
             SUM(usd.net_salary) AS total_net_salary
      FROM users_salary_details usd
      LEFT JOIN users_master um ON um.id = usd.user_id
      LEFT JOIN department_master dm ON dm.id = um.department_id
      LEFT JOIN designation_master dm2 ON dm2.id = um.designation_id
      WHERE usd.status = 1 AND usd.salary_type = 1
      GROUP BY ${groupExpr}
      ORDER BY total_net_salary DESC`;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Grouped Salary Data";
    return responseCodes.BAD_REQUEST;
  }
};