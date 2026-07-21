const { medicalInsurance } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

exports.addData = async function (body) {
  try {
    const result = await medicalInsurance.create(body.data);
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
    await medicalInsurance.update(body.data, {
      where: { id: body.id },
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
    await medicalInsurance.update(body.data, {
      where: { id: body.id },
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

// Admin-wide list — every employee's insurance enrollments.
exports.getAllData = async function () {
  try {
    const query = `select mi.*, concat(emp.first_name, ' ', emp.last_name) as employee_name,
                    CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) as created_name,
                    concat(um2.first_name, ' ', um2.last_name) as modified_name
                  from medical_insurance mi
                  join users_master emp on emp.id = mi.employee_id
                  join users_master um on um.id = mi.created_by
                  left join users_master um2 on um2.id = mi.modified_by
                  where mi.status = 1
                  order by mi.id desc;`;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};

// Employee self-service — only this employee's own enrollments (used by the My Profile tab).
exports.getOneData = async function (employee_id) {
  try {
    if (!employee_id) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "Employee ID is required";
      return responseCodes.BAD_REQUEST;
    }
    const query = `select mi.* from medical_insurance mi
                  where mi.employee_id = :employee_id and mi.status = 1
                  order by mi.id desc;`;
    const data = await sequelize.query(query, {
      replacements: { employee_id },
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
