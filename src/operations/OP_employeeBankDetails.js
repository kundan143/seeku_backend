const { usersBankDetails } = require("../models");
// const { addActivityLog } = require("../services/activityLog");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require("sequelize");

exports.addData = async function (body) {
  try {
    var result = await usersBankDetails.create(body.data);
    responseCodes.SUCCESS.data = result.id;
    // sendNotification("new_user_added", result.id, body.data.created_by);
    // addActivityLog(usersMaster.tableName, result.id, body, "ADD");
    responseCodes.SUCCESS.message = "Row Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateData = async function (body) {
  try {
    await usersBankDetails.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    // addActivityLog(usersMaster.tableName, body.id, body, "UPDATE");
    responseCodes.SUCCESS.message = "Row Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  try {
    await usersBankDetails.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    // addActivityLog(usersMaster.tableName, body.id, body, "DELETE");
    responseCodes.SUCCESS.message = "Row Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getAllData = async function (body) {
  try {
    var query = `SELECT ubd.id, CONCAT(um.first_name, ' ', um.last_name) AS emp_name, bm.bank_name, 
                ubd.ifsc_code, ubd.account_number, ubd.is_active, um.id as user_id, bm.id as bank_id,
                ubd.branch_name 
                FROM users_bank_details AS ubd
                INNER JOIN users_master AS um ON um.id = ubd.user_id
                INNER JOIN bank_master AS bm ON bm.id = ubd.bank_id
                WHERE ubd.is_active = TRUE
                ORDER BY ubd.id DESC;`;
    var data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
exports.getOneData = async function (id) {
  try {
    var data = await usersBankDetails.findOne({
      where: {
        id: id,
        status: { [Op.ne]: 0 }, // Exclude records with status 0
      },
    });
    if (data) {
      responseCodes.SUCCESS.data = data;
      responseCodes.SUCCESS.message = "";
      return responseCodes.SUCCESS;
    } else {
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "No Record Found";
      return responseCodes.NOT_FOUND;
    }
  } catch (e) {
    
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
}