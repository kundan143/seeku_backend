const { employeeExpenses, employeeExpenseTravelLegs } = require("../models");
// const { addActivityLog } = require("../services/activityLog");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require("sequelize");

exports.addData = async function (body) {
  const t = await sequelize.transaction();
  try {
    const { travel_legs, ...expenseData } = body.data;
    var result = await employeeExpenses.create(expenseData, { transaction: t });
    if (Array.isArray(travel_legs) && travel_legs.length) {
      await employeeExpenseTravelLegs.bulkCreate(
        travel_legs.map((leg) => ({ ...leg, employee_expense_id: result.id })),
        { transaction: t }
      );
    }
    await t.commit();
    responseCodes.SUCCESS.data = result.id;
    // sendNotification("new_user_added", result.id, body.data.created_by);
    // addActivityLog(usersMaster.tableName, result.id, body, "ADD");
    responseCodes.SUCCESS.message = "Row Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateData = async function (body) {
  const t = await sequelize.transaction();
  try {
    const { travel_legs, ...expenseData } = body.data;
    await employeeExpenses.update(expenseData, {
      where: {
        id: body.id,
      },
      transaction: t,
    });
    if (Array.isArray(travel_legs)) {
      await employeeExpenseTravelLegs.destroy({ where: { employee_expense_id: body.id }, transaction: t });
      if (travel_legs.length) {
        await employeeExpenseTravelLegs.bulkCreate(
          travel_legs.map((leg) => ({ ...leg, employee_expense_id: body.id })),
          { transaction: t }
        );
      }
    }
    await t.commit();
    responseCodes.SUCCESS.data = null;
    // addActivityLog(usersMaster.tableName, body.id, body, "UPDATE");
    responseCodes.SUCCESS.message = "Row Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
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
    let statusFilter = '';
    if (body.status !== undefined && body.status !== null) {
      statusFilter = ` AND ee.status = ${body.status}`;
    }
    let query = `SELECT ee.*, etm.expense_type_name,
        CASE
            WHEN ee.status = 0 THEN 'Pending'
            WHEN ee.status = 1 THEN 'Approved'
            WHEN ee.status = 2 THEN 'Rejected'
            ELSE 'Unknown'
        END AS status_name,
        CONCAT(emp.first_name, ' ', emp.last_name) AS employee_name,
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
        END AS action_by_date,
        (SELECT COALESCE(json_agg(
                json_build_object(
                    'id', tl.id,
                    'employee_expense_id', tl.employee_expense_id,
                    'from_location_id', tl.from_location_id,
                    'from_location_name', fc.name,
                    'to_location_id', tl.to_location_id,
                    'to_location_name', tc.name,
                    'purpose', tl.purpose,
                    'vehicle_type', tl.vehicle_type,
                    'distance_km', tl.distance_km,
                    'rate_per_km', tl.rate_per_km,
                    'sub_total', tl.sub_total,
                    'created_date', tl.created_date
                ) ORDER BY tl.id
            ), '[]')
            FROM employee_expense_travel_leg tl
            LEFT JOIN city_master fc ON fc.id = tl.from_location_id
            LEFT JOIN city_master tc ON tc.id = tl.to_location_id
            WHERE tl.employee_expense_id = ee.id) AS travel_legs
        FROM employee_expense AS ee
        JOIN expense_type_master AS etm ON ee.expense_type_id = etm.id
        JOIN users_master AS emp ON ee.created_by = emp.id
        JOIN users_master AS emp2 on ee.employee_id = emp2.id
        LEFT JOIN users_master AS appr ON ee.modified_by = appr.id
        WHERE ee.status != 3
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
        END AS action_by_date,
        (SELECT COALESCE(json_agg(
                json_build_object(
                    'id', tl.id,
                    'employee_expense_id', tl.employee_expense_id,
                    'from_location_id', tl.from_location_id,
                    'from_location_name', fc.name,
                    'to_location_id', tl.to_location_id,
                    'to_location_name', tc.name,
                    'purpose', tl.purpose,
                    'vehicle_type', tl.vehicle_type,
                    'distance_km', tl.distance_km,
                    'rate_per_km', tl.rate_per_km,
                    'sub_total', tl.sub_total,
                    'created_date', tl.created_date
                ) ORDER BY tl.id
            ), '[]')
            FROM employee_expense_travel_leg tl
            LEFT JOIN city_master fc ON fc.id = tl.from_location_id
            LEFT JOIN city_master tc ON tc.id = tl.to_location_id
            WHERE tl.employee_expense_id = ee.id) AS travel_legs
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
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to load data";
    return responseCodes.BAD_REQUEST;
  }
};
