const { employeeExpenses } = require("../models");
// const { addActivityLog } = require("../services/activityLog");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require("sequelize");

exports.addData = async function (body) {
  try {
    var result = await employeeExpenses.create(body.data);
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
    await employeeExpenses.update(body.data, {
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
    await employeeExpenses.update(body.data, {
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
    let query = `SELECT ee.*, etm.expense_type_name,
        CASE
            WHEN ee.status = 0 THEN 'Pending'
            WHEN ee.status = 1 THEN 'Approved'
            WHEN ee.status = 2 THEN 'Rejected'
            ELSE 'Unknown'
        END AS status_name,
        CASE
            WHEN ee.status = 0 THEN CONCAT(emp.first_name, ' ', emp.last_name)
            WHEN ee.status = 1 THEN CONCAT(appr.first_name, ' ', appr.last_name)
            WHEN ee.status = 2 THEN CONCAT(appr.first_name, ' ', appr.last_name)
            ELSE 'Unknown'
        END AS action_by_name,
        CASE
            WHEN ee.status = 0 THEN ee.created_date
            WHEN ee.status = 1 THEN ee.modified_date
            WHEN ee.status = 2 THEN ee.modified_date
            ELSE null
        END AS action_by_date
        FROM employee_expense AS ee
        JOIN expense_type_master AS etm ON ee.expense_type_id = etm.id
        JOIN users_master AS emp ON ee.created_by = emp.id
        LEFT JOIN users_master AS appr ON ee.modified_by = appr.id
        WHERE ee.status != 3 AND ee.status = ${body.status}
        ORDER BY ee.id DESC;`;

    const data = await sequelize.query(query, {
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
exports.getOneData = async function (employee_id) {
  try {
    if (!employee_id) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "Employee ID is required";
      return responseCodes.BAD_REQUEST;
    }

    const query = `
      SELECT ee.*, etm.expense_type_name,
        CASE
            WHEN ee.status = 0 THEN 'Pending'
            WHEN ee.status = 1 THEN 'Approved'
            WHEN ee.status = 2 THEN 'Rejected'
            ELSE 'Unknown'
        END AS status_name,
        CASE
            WHEN ee.status = 0 THEN CONCAT(emp.first_name, ' ', emp.last_name)
            WHEN ee.status = 1 THEN CONCAT(appr.first_name, ' ', appr.last_name)
            WHEN ee.status = 2 THEN CONCAT(appr.first_name, ' ', appr.last_name)
            ELSE 'Unknown'
        END AS action_by_name,
        CASE
            WHEN ee.status = 0 THEN ee.created_date
            WHEN ee.status = 1 THEN ee.modified_date
            WHEN ee.status = 2 THEN ee.modified_date
            ELSE null
        END AS action_by_date
        FROM employee_expense AS ee
        JOIN expense_type_master AS etm ON ee.expense_type_id = etm.id
        JOIN users_master AS emp ON ee.created_by = emp.id
        LEFT JOIN users_master AS appr ON ee.modified_by = appr.id
        WHERE ee.employee_id = :employee_id AND ee.status != 3
        ORDER BY ee.id DESC;
    `;

    const data = await sequelize.query(query, {
        replacements: { employee_id },
        type: QueryTypes.SELECT,
    });

    if (data && data.length > 0) {
        responseCodes.SUCCESS.data = data;
        responseCodes.SUCCESS.message = "";
        return responseCodes.SUCCESS;
    } else {
        responseCodes.NOT_FOUND.data = null;
        responseCodes.NOT_FOUND.message = "No record found";
        return responseCodes.NOT_FOUND;
    }
} catch (e) {
    console.error("Error in getOneData:", e);
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to load data";
    return responseCodes.BAD_REQUEST;
  }
};
