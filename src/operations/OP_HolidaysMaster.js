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
    
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
exports.getLastFiveHolidays = async function () {
  try {
    var query = `SELECT hm.holiday_name as name, hm.holiday_date as date, (hm.holiday_date - CURRENT_DATE) AS days_left
                FROM holidays_master hm
                WHERE hm.status = 1
                AND hm.holiday_date >= CURRENT_DATE
                AND EXTRACT(YEAR FROM hm.holiday_date) = EXTRACT(YEAR FROM CURRENT_DATE)
                ORDER BY hm.holiday_date ASC
                LIMIT 4;;`;
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
exports.getHolidaysCount = async function (body) {
  try {
    var query = `SELECT count(*) as total_holidays
                  FROM holidays_master hm
                  WHERE hm.is_optional = false
                  AND hm.status = 1
                  AND DATE(hm.holiday_date) BETWEEN DATE('${body.start_date}') AND DATE('${body.end_date}');`;
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
    
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
