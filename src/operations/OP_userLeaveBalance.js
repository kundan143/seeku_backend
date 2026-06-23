const { userLeaveBalance } = require("../models");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require("sequelize");
const currentYear = new Date().getFullYear();

exports.addData = async function (body) {
  try {
    var result = await userLeaveBalance.create(body.data);
    responseCodes.SUCCESS.data = result.id;
    responseCodes.SUCCESS.message = "Row Added Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateData = async function (body) {
  try {
    await userLeaveBalance.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
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
    await userLeaveBalance.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
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
    let query = `select concat(um.first_name, ' ', um.last_name ) as user_name, 
                  concat(ltm.leave_name, ' (', ltm.leave_code,')') as leave_type, 
                  ulb.* 
                  from user_leave_balance ulb
                  join users_master um on um.id = ulb.user_id 
                  join leave_type_master ltm on ltm.id = ulb.leave_type_id 
                  where ulb.status = 1
                  order by ulb.id ASC;`;
    const data = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e);
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getOneData = async function (id) {
  try {
    const currentYear = new Date().getFullYear();
    let query = `select ltm.leave_name as label, ltm.icon, 
                  ulb.allocated_days as total, ulb.used_days as used, 
                  ltm.color_code, ulb.remaining_days as remaining
                  from user_leave_balance ulb
                  join users_master um on um.id = ulb.user_id 
                  join leave_type_master ltm on ltm.id = ulb.leave_type_id 
                  where ulb.status = 1 and ulb.user_id = ${id} and ulb.year = ${currentYear}
                  order by ulb.id desc;`;
    const data = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e);
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
exports.getTotalRemainingLeave = async function (id) {
  try {
    const totalRemainingLeave = await userLeaveBalance.sum("remaining_days", {
      where: {
        user_id: id,
        year: new Date().getFullYear(),
      },
    });
    console.log("totalRemainingLeave",totalRemainingLeave)
    responseCodes.SUCCESS.data = totalRemainingLeave;
		responseCodes.SUCCESS.message = "";
		return responseCodes.SUCCESS;
  } catch (error) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
