const { salaryIncrementHistory } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

// Read-only history of increments applied via Employee Salary Master's "Give Increment"
// action (see OP_usersSalaryDetails.applyIncrement, which is the only writer of this table).
exports.getAllData = async function () {
  try {
    const query = `
      SELECT sih.*,
             CONCAT(um.first_name, ' ', um.middle_name, ' ', um.last_name) AS emp_name,
             dm.name AS department_name,
             dm2.designation AS designation_name,
             CASE WHEN sih.disbursement_month IS NOT NULL
                  THEN TRIM(TO_CHAR(TO_DATE(sih.disbursement_month::TEXT, 'MM'), 'Month'))
                  ELSE NULL END AS disbursement_month_name
      FROM salary_increment_history sih
      LEFT JOIN users_master um ON um.id = sih.user_id
      LEFT JOIN department_master dm ON dm.id = um.department_id
      LEFT JOIN designation_master dm2 ON dm2.id = um.designation_id
      WHERE sih.status = 1
      ORDER BY sih.id DESC`;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Increment History";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getDataByUserId = async function (user_id) {
  try {
    const query = `
      SELECT sih.*,
             CONCAT(um.first_name, ' ', um.middle_name, ' ', um.last_name) AS emp_name,
             CASE WHEN sih.disbursement_month IS NOT NULL
                  THEN TRIM(TO_CHAR(TO_DATE(sih.disbursement_month::TEXT, 'MM'), 'Month'))
                  ELSE NULL END AS disbursement_month_name
      FROM salary_increment_history sih
      LEFT JOIN users_master um ON um.id = sih.user_id
      WHERE sih.user_id = :user_id AND sih.status = 1
      ORDER BY sih.id DESC`;
    const data = await sequelize.query(query, {
      replacements: { user_id },
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Increment History";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getOneData = async function (id) {
  try {
    const data = await salaryIncrementHistory.findAll({ where: { id: id } });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Increment History";
    return responseCodes.BAD_REQUEST;
  }
};
