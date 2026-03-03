const { holidaysMaster } = require("../models");
// const { addActivityLog } = require("../services/activityLog");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require("sequelize");

exports.addData = async function (body) {
  try {
    var result = await holidaysMaster.create(body.data);
    responseCodes.SUCCESS.data = result;
    // sendNotification("new_user_added", result.id, body.data.created_by);
    // addActivityLog(usersMaster.tableName, result.id, body, "ADD");
    responseCodes.SUCCESS.message = "Row Added Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e);
    console.log("Error name:", e.name);
    console.log("Error message:", e.message);
    console.log(
      "Error fields:",
      e.errors ? e.errors.map((err) => err.path) : null
    );
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateData = async function (body) {
  try {
    await holidaysMaster.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    // addActivityLog(usersMaster.tableName, body.id, body, "UPDATE");
    responseCodes.SUCCESS.message = "Row Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e, "ERROR");
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  try {
    await holidaysMaster.update(body.data, {
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const whereCondition = {
      status: {
        [Op.and]: [
          { [Op.ne]: 3 },
          ...(body.status !== undefined ? [{ [Op.eq]: body.status }] : []),
        ],
      },
    };
    const data = await holidaysMaster.findAll({
      where: whereCondition,
      order: [["holiday_date", "ASC"]],
    });
    const upcoming = data.filter(
      (item) => new Date(item.holiday_date) >= today
    );
    const past = data
      .filter((item) => new Date(item.holiday_date) < today)
      .sort((a, b) => new Date(b.holiday_date) - new Date(a.holiday_date));
    const finalList = [...upcoming, ...past];

    responseCodes.SUCCESS.data = finalList;
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
    var data = await holidaysMaster.findOne({
      where: {
        id: id,
        status: { [Op.ne]: 3 }, // Exclude records with status 3
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
    console.log(e);
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
