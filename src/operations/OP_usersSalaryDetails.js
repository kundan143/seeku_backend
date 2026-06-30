const { usersSalaryDetails} = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

exports.addData = async function (body) {
  const t = await sequelize.transaction();
  try {
    const result = await usersSalaryDetails.create(body.data, {
      transaction: t,
    });

    await t.commit(); // ✅ Commit on success

    responseCodes.SUCCESS.data = result.id;
    responseCodes.SUCCESS.message = "Salary Added Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback(); // ❌ Rollback on failure
    console.error(e);
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Leave";
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
    console.error(e);
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Leave";
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
    // addActivityLog(usersMaster.tableName, body.id, body, "DELETE");
    responseCodes.SUCCESS.message = "Row Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getAllData = async function (body) {
  try {
    var query = `select concat(um.first_name, ' ', um.last_name) as name, usd.* 
                  from users_salary_details usd 
                  left join users_master um on um.id = usd.user_id 
                  where usd.status = 1`;
    var data = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};