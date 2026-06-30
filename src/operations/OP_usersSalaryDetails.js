const { usersSalaryDetails } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

exports.addData = async function (body) {
  const t = await sequelize.transaction();
  try {
    const result = await usersSalaryDetails.create(body.data, {
      transaction: t,
    });
    await t.commit();
    responseCodes.SUCCESS.data = result.id;
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
    await usersSalaryDetails.update(body.data, {
      where: { id: body.id },
      transaction: t,
    });
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
             CONCAT(um.first_name, ' ', um.last_name) AS emp_name
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
             CONCAT(um.first_name, ' ', um.last_name) AS emp_name,
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
             CONCAT(um.first_name, ' ', um.last_name) AS emp_name
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