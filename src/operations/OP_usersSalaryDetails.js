const { usersSalaryDetails } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

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
    console.log("Error in addData:", e);
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
             CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS emp_name
      FROM users_salary_details usd
      LEFT JOIN users_master um ON um.id = usd.user_id
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
             um.mobile, um.email, um.doj,
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
             CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS emp_name
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