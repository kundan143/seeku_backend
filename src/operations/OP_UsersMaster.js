const {
  usersMaster,
  emergencyContacts,
  usersBankDetails,
  usersSalaryDetails,
} = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

exports.addData = async function (body) {
  let t;
  try {
    // Basic input validation
    if (!body.userDetails || !body.userDetails.mobile) {
      throw new TypeError("Missing required field");
    }

    t = await sequelize.transaction();

    // Hash password
    const password = await bcrypt.hash(body.userDetails.mobile, saltRounds);
    body.userDetails.password = password;
    // body.userDetails.nationality_id = body.userDetails.nationality_id?.id || 1;
    // body.userDetails.role_id = body.userDetails.role_id || 1;
    // body.userDetails.username = body.userDetails.mobile;
    // Create user
    const userResult = await usersMaster.create(body.userDetails, {
      transaction: t,
    });

    // Emergency contact
    if (body.emergencyDetails) {
      await emergencyContacts.create(
        {
          user_id: userResult.id,
          contact_name: body.emergencyDetails.contact_name,
          relation_id: body.emergencyDetails.relation_id,
          emergency_mobile: body.emergencyDetails.emergency_mobile,
        },
        { transaction: t }
      );
    }

    // Bank details
    if (body.bankDetails) {
      await usersBankDetails.create(
        {
          user_id: userResult.id,
          bank_id: body.bankDetails.bank_id,
          account_number: body.bankDetails.account_number,
          ifsc_code: body.bankDetails.ifsc_code,
          created_by: body.bankDetails.created_by,
          created_date: body.bankDetails.created_date,
        },
        { transaction: t }
      );
    }

    // Salary details
    if (body.salaryDetails) {
      await usersSalaryDetails.create(
        {
          user_id: userResult.id,
          basic_salary: body.salaryDetails.basic_salary,
          hra: body.salaryDetails.hra,
          conveyance: body.salaryDetails.conveyance,
          medical_allowance: body.salaryDetails.medical_allowance,
          special_allowance: body.salaryDetails.special_allowance,
          bonus: body.salaryDetails.bonus,
          pf_employer: body.salaryDetails.pf_employer,
          pf_employee: body.salaryDetails.pf_employee,
          esi_employer: body.salaryDetails.esi_employer,
          esi_employee: body.salaryDetails.esi_employee,
          professional_tax: body.salaryDetails.professional_tax,
          other_deduction: body.salaryDetails.other_deduction,
          gross_salary: body.salaryDetails.gross_salary,
          net_salary: body.salaryDetails.net_salary,
          created_by: body.salaryDetails.created_by,
          created_date: body.salaryDetails.created_date,
        },
        { transaction: t }
      );
    }

    await t.commit();

    responseCodes.SUCCESS.data = userResult.id;
    responseCodes.SUCCESS.message = "Employee Added Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    if (t) await t.rollback();
    // Advanced error handling
    let errorMsg = "Failed to Add Employee";
    if (e instanceof TypeError) {
      errorMsg = `Type Error: ${e.message}`;
    } else if (e.name === "SequelizeValidationError") {
      errorMsg = `Validation Error: ${e.errors
        .map((err) => err.message)
        .join(", ")}`;
    } else if (e.name === "SequelizeUniqueConstraintError") {
      errorMsg = `Unique Constraint Error: ${e.errors
        .map((err) => err.message)
        .join(", ")}`;
    }
    console.log(e);
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = errorMsg;
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateData = async function (body) {
  let t;
  try {
    // Basic input validation
    if (!body.userDetails || !body.id) {
      throw new TypeError("Missing required field: data or id");
    }

    t = await sequelize.transaction();

    // Hash password if present
    if (body.userDetails.password != null) {
      body.userDetails.password = await bcrypt.hash(
        body.userDetails.password,
        saltRounds
      );
    } else if (body.userDetails.mobile) {
      body.userDetails.password = await bcrypt.hash(
        body.userDetails.mobile,
        saltRounds
      );
    }

    // Update user
    await usersMaster.update(body.userDetails, {
      where: { id: body.id },
      transaction: t,
    });

    // Emergency contact update (if present)
    if (body.emergencyDetails) {
      await emergencyContacts.update(body.emergencyDetails, {
        where: { user_id: body.id },
        transaction: t,
      });
    }

    // Bank details update (if present)
    if (body.bankDetails) {
      await usersBankDetails.update(body.bankDetails, {
        where: { user_id: body.id },
        transaction: t,
      });
    }

    // Salary details update (if present)
    if (body.salaryDetails) {
      await usersSalaryDetails.update(body.salaryDetails, {
        where: { user_id: body.id },
        transaction: t,
      });
    }

    await t.commit();

    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Row Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    if (t) await t.rollback();
    // Advanced error handling
    let errorMsg = "Failed to Update Row";
    if (e instanceof TypeError) {
      errorMsg = `Type Error: ${e.message}`;
    } else if (e.name === "SequelizeValidationError") {
      errorMsg = `Validation Error: ${e.errors
        .map((err) => err.message)
        .join(", ")}`;
    } else if (e.name === "SequelizeUniqueConstraintError") {
      errorMsg = `Unique Constraint Error: ${e.errors
        .map((err) => err.message)
        .join(", ")}`;
    }
    console.log(e, "ERROR");
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = errorMsg;
    return responseCodes.BAD_REQUEST;
  }
};
exports.updatePassword = async function (body) {
  try {
    if (body.data.password != null) {
      body.data.password = await bcrypt.hash(body.data.password, saltRounds);
    }
    await usersMaster.update(body.data, {
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
    await usersMaster.destroy({
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
    let status = ``;

    if (body.status == 0) {
      status = `WHERE account_block = false`;
    } else if (body.status == 1) {
      status = `WHERE account_block = true`;
    } else {
      status = ``;
    }
    var query = `SELECT um.*, concat(um.first_name, ' ',um.last_name) as full_name,  rm.role_name
		FROM users_master AS um
		JOIN role_master AS rm ON rm.id = um.role_id
		${status} ORDER BY um.id ASC`;
    var data = await sequelize.query(query, {
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
exports.permissionUser = async function (body) {
  try {
    let status = ``;
    status = `WHERE status = true and designation_id = ${body.designation_id}`

    let query = `SELECT um.*, concat(um.first_name, ' ',um.last_name) as full_name,  rm.role_name
		FROM users_master AS um
		JOIN role_master AS rm ON rm.id = um.role_id
		${status} ORDER BY um.id ASC`;
    var data = await sequelize.query(query, {
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
exports.getActiveUsers = async function (body) {
  try {
    var query = `SELECT um.*, concat(um.first_name, ' ',um.last_name) as full_name,  rm.role_name 
		FROM users_master AS um 
		JOIN role_master AS rm ON rm.id = um.role_id 
		WHERE account_block = false ORDER BY um.id ASC`;
    var data = await sequelize.query(query, {
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
exports.getActiveUsersById = async function (body) {
  try {
    var query = `SELECT um.*, concat(um.first_name, ' ',um.last_name) as full_name,  rm.role_name 
		FROM users_master AS um 
		JOIN role_master AS rm ON rm.id = um.role_id 
		WHERE um.id != ${body.id} AND account_block = false 
		ORDER BY um.id ASC`;
    var data = await sequelize.query(query, {
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
    var query = `select usd.basic_salary, usd.hra, usd.conveyance, usd.medical_allowance,
    usd.special_allowance, usd.bonus, usd.pf_employee, usd.esi_employer, usd.esi_employee,
    usd.esi_employer, usd.professional_tax, usd.professional_tax, usd.other_deduction,usd.gross_salary,
    usd.net_salary, um.first_name, um.last_name, um.middle_name,
    um.email, um.work_email,um.mobile, um.dob, um.doj,
    um.current_address, um.permanent_address, gm.gender_name,
    msm.status_name, cm."name" as national_name, etm.emp_type_name,
    dm."name" as department_name, dm2.designation as designation_name,
    concat(um2.first_name,' ', um2.last_name) as reporting_manager_name,
    bgm.blood_group_name, ec.contact_name as emergency_contact_name,
    rm.relation_name as emergency_relation_name, ec.emergency_mobile,
    bm.bank_name, ubd.account_number, ubd.ifsc_code, gm.id as gender_id,
    msm.id as marital_status_id, bgm.id as blood_group_id, etm.id as emp_type_id,
    dm.id as department_id, dm2.id as designation_id, um2.id as reporting_manager_id,
    cm.id as nationality_id, ec.contact_name, rm.id as relation_id, bm.id as bank_id
    from users_master as um
    JOIN gender_master gm on gm.id = um.gender_id
    JOIN marital_status_master msm on msm.id = um.marital_status_id
    JOIN country_master cm on cm.id = um.nationality_id
    JOIN emp_type_master etm on etm.id = um.emp_type_id
    JOIN department_master dm on dm.id = um.department_id
    JOIN designation_master dm2 on dm2.id = um.designation_id
    JOIN users_master um2 on um2.id = um.reporting_manager_id
    JOIN blood_group_master bgm on bgm.id = um.blood_group_id
    JOIN emergency_contacts ec on ec.user_id = um.id
    JOIN relation_master rm on rm.id = ec.relation_id
    JOIN users_bank_details ubd on ubd.user_id = um.id
    JOIN bank_master bm on bm.id = ubd.bank_id
    JOIN users_salary_details usd ON usd.user_id = um.id
		WHERE um.id = ${id}
    ORDER BY usd.id DESC
    LIMIT 1`;
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

exports.getRoleWiseUsers = async function (body) {
  try {
    var query = `SELECT um.*, rm.role_name 
		FROM users_master AS um 
		JOIN role_master AS rm ON rm.id = um.role_id 
		WHERE rm.id IN (${body.role_id}) AND account_block = false `;
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

exports.updateToken = async function (body) {
  try {
    await usersMaster.update(
      {
        user_fcm_token: body.user_fcm_token,
      },
      {
        where: {
          id: body.id,
        },
      }
    );
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Token Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e, "ERROR");
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getTokens = async function (body) {
  try {
    var query =
      `SELECT user_fcm_token 
		FROM users_master 
		WHERE user_fcm_token IS NOT NULL AND status = ` + body.status;
    var data = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "Token Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e, "ERROR");
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Data";
    return responseCodes.BAD_REQUEST;
  }
};
