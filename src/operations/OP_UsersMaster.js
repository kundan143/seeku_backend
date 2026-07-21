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
const { copyRoleTemplateToUser } = require("./OP_RolePermission");
const saltRounds = 10;

// emp_code = YYMMDD + 4-digit sequence that resets daily (e.g. 2607150001)
async function generateEmpCode(transaction) {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const codeDate = `${now.getFullYear()}-${mm}-${dd}`;

  const rows = await sequelize.query(
    `INSERT INTO emp_code_counter (code_date, last_seq)
     VALUES (:codeDate, 1)
     ON CONFLICT (code_date) DO UPDATE SET last_seq = emp_code_counter.last_seq + 1
     RETURNING last_seq`,
    { replacements: { codeDate }, type: QueryTypes.SELECT, transaction }
  );

  const seq = String(rows[0].last_seq).padStart(4, "0");
  return `${yy}${mm}${dd}${seq}`;
}

exports.addData = async function (body) {
  let t;
  try {
    // Basic input validation
    if (!body.userDetails || !body.userDetails.mobile) {
      throw new TypeError("Missing required field");
    }

    t = await sequelize.transaction();

    body.userDetails.emp_code = await generateEmpCode(t);

    // Hash password
    const password = await bcrypt.hash(body.userDetails.mobile, saltRounds);
    body.userDetails.password = password;
    // body.userDetails.nationality_id = body.userDetails.nationality_id?.id || 1;
    // body.userDetails.role_id = body.userDetails.role_id || 1;
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

    // New user starts with their role's default permission set.
    if (body.userDetails.role_id) {
      await copyRoleTemplateToUser(
        { roleId: body.userDetails.role_id, userId: userResult.id, createdBy: body.userDetails.created_by },
        t
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
    
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = errorMsg;
    return responseCodes.BAD_REQUEST;
  }
};

// Employee bulk import: rows are already parsed & validated client-side
// (dropdown text resolved to ids), so this just persists them one by one and
// reports back a per-row outcome. Rows matching an existing email or mobile
// are skipped as duplicates rather than failed, since there's no DB-level
// unique constraint on those columns to rely on.
exports.bulkImport = async function (body) {
  try {
    const rows = Array.isArray(body.data) ? body.data : [];
    const created_by = body.created_by;
    const created_date = body.created_date;

    if (!rows.length) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "No rows to import.";
      return responseCodes.BAD_REQUEST;
    }

    let successCount = 0;
    let duplicateCount = 0;
    const failures = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      let t;
      try {
        if (!row.first_name || !row.last_name || !row.email || !row.mobile || !row.designation_id || !row.role_id) {
          throw new Error("First Name, Last Name, Email, Mobile, Designation and Role are required.");
        }

        const existing = await usersMaster.findOne({
          where: { [Op.or]: [{ email: row.email }, { mobile: row.mobile }] },
        });
        if (existing) {
          duplicateCount++;
          continue;
        }

        t = await sequelize.transaction();

        const emp_code = await generateEmpCode(t);
        const password = await bcrypt.hash(row.mobile, saltRounds);

        const userResult = await usersMaster.create(
          {
            ...row,
            emp_code,
            password,
            created_by,
            created_date,
          },
          { transaction: t }
        );

        await copyRoleTemplateToUser(
          { roleId: row.role_id, userId: userResult.id, createdBy: created_by },
          t
        );

        await t.commit();
        successCount++;
      } catch (e) {
        if (t) await t.rollback();
        failures.push({
          row: row.rowNumber || i + 2,
          name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || `Row ${i + 2}`,
          error: e.message || 'Failed to import row.',
        });
      }
    }

    responseCodes.SUCCESS.data = { successCount, duplicateCount, failedCount: failures.length, failures };
    responseCodes.SUCCESS.message = `Imported ${successCount} of ${rows.length} employee(s) (${duplicateCount} already existed).`;
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to import employees.";
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

    delete body.userDetails.emp_code;

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
    
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = errorMsg;
    return responseCodes.BAD_REQUEST;
  }
};

// Dedicated action (as opposed to a role_id change sliding through the
// generic updateData above) so that assigning a role always, explicitly,
// resets the user's permissions to that role's current template —
// generic profile edits that happen to touch role_id should not silently
// wipe a user's hand-tuned permissions as a side effect.
exports.assignRole = async function (body) {
  let t;
  try {
    if (!body.id || !body.role_id) {
      throw new TypeError("Missing required field: id or role_id");
    }

    t = await sequelize.transaction();

    await usersMaster.update(
      {
        role_id: body.role_id,
        modified_by: body.modified_by,
        modified_date: new Date(),
      },
      { where: { id: body.id }, transaction: t }
    );

    await copyRoleTemplateToUser(
      { roleId: body.role_id, userId: body.id, createdBy: body.modified_by },
      t
    );

    await t.commit();

    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Role assigned successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    if (t) await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to assign role";
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
    
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  try {
    console.log(body,"kundan")
    if (!body?.id) {
      return { ...responseCodes.BAD_REQUEST, message: "Missing id" };
    }

    const [affectedRows] = await usersMaster.update(body.data, {
      where: { id: body.id },
    });

    if (affectedRows === 0) {
      return { ...responseCodes.BAD_REQUEST, message: "No row found to update" };
    }
    return {...responseCodes.SUCCESS,data: null,message: "Row Updated Successfully",};
  } catch (e) {
    return {...responseCodes.BAD_REQUEST,data: e,message: "Failed to Update Row"};
  }
};

exports.getAllData = async function (body) {
  try {
    let status = ``;

    if (body.status == 0) {
      status = `WHERE um.account_block = false AND um.status = true`;
    } else if (body.status == 1) {
      status = `WHERE um.account_block = true`;
    } else {
      status = ``;
    }
    var query = `SELECT concat(um.first_name, ' ',um.last_name) as full_name,  rm.role_name, 
    dm.designation as designation_name, dm2."name" as department_name, gm.gender_name, etm.emp_type_name,
    concat(um2.first_name, ' ',um2.last_name) as manager_name, msm.status_name as marital_status_name, um.*
		FROM users_master AS um
		JOIN role_master AS rm ON rm.id = um.role_id
		join designation_master dm on dm.id = um.designation_id  
		join department_master dm2 on dm2.id = um.department_id 
		join gender_master gm on gm.id = um.gender_id 
		left join users_master um2 on um2.id = um.reporting_manager_id
    join marital_status_master msm on msm.id = um.marital_status_id 
		join emp_type_master etm on etm.id = um.emp_type_id 
		${status} ORDER BY um.id ASC`;
    var data = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e, "error");
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
exports.permissionUser = async function (body) {
  try {
    let status = ``;
    status = `WHERE status = true and designation_id = :designation_id`

    let query = `SELECT um.*, concat(um.first_name, ' ',um.last_name) as full_name,  rm.role_name
		FROM users_master AS um
		JOIN role_master AS rm ON rm.id = um.role_id
		${status} ORDER BY um.id ASC`;
    var data = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { designation_id: body.designation_id },
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
		WHERE um.id != :userId AND account_block = false
		ORDER BY um.id ASC`;
    var data = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { userId: body.id },
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

exports.getOneData = async function (id) {
  try {
    var query = `select usd.basic_salary, usd.hra, usd.conveyance, usd.medical_allowance,
    usd.special_allowance, usd.bonus, usd.pf_employee, usd.esi_employer,
    usd.professional_tax, usd.other_deduction,usd.gross_salary,
    usd.net_salary, um.first_name, um.last_name, um.middle_name,
    um.email, um.work_email, um.work_mobile, um.mobile, um.dob, um.doj,
    um.current_address, um.permanent_address, um.profile_pic, gm.gender_name,
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
    LEFT JOIN gender_master gm on gm.id = um.gender_id
    LEFT JOIN marital_status_master msm on msm.id = um.marital_status_id
    LEFT JOIN country_master cm on cm.id = um.nationality_id
    LEFT JOIN emp_type_master etm on etm.id = um.emp_type_id
    LEFT JOIN department_master dm on dm.id = um.department_id
    LEFT JOIN designation_master dm2 on dm2.id = um.designation_id
    LEFT JOIN users_master um2 on um2.id = um.reporting_manager_id
    LEFT JOIN blood_group_master bgm on bgm.id = um.blood_group_id
    LEFT JOIN emergency_contacts ec on ec.user_id = um.id
    LEFT JOIN relation_master rm on rm.id = ec.relation_id
    LEFT JOIN users_bank_details ubd on ubd.user_id = um.id
    LEFT JOIN bank_master bm on bm.id = ubd.bank_id
    LEFT JOIN users_salary_details usd ON usd.user_id = um.id
		WHERE um.id = :id
    ORDER BY usd.id DESC
    LIMIT 1`;
    var data = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { id },
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
    const roleIds = (Array.isArray(body.role_id) ? body.role_id : String(body.role_id).split(','))
      .map(Number).filter(n => !isNaN(n) && n > 0);
    if (!roleIds.length) throw new Error('Invalid role_id');
    var query = `SELECT um.*, rm.role_name
		FROM users_master AS um
		JOIN role_master AS rm ON rm.id = um.role_id
		WHERE rm.id IN (:roleIds) AND account_block = false `;
    var data = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { roleIds },
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
		WHERE user_fcm_token IS NOT NULL AND status = :status`;
    var data = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { status: body.status },
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "Token Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getCompanyHierarchy = async function () {
  try {
    let query = {};
    query = `select um.id, CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) as name, dm.designation as role,
              dm2."name" as dept, um.work_email, um.work_mobile, um.reporting_manager_id as managerId
              from users_master as um
              join designation_master dm on dm.id = um.designation_id
              join department_master dm2 on dm2.id = um.department_id
              where um.status = true
              ORDER BY um.reporting_manager_id  DESC;`;
    const data = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e, "error");
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
exports.getEmpName = async function (id) {
  try {
    let query = {};
    query = `select um.id, concat(um.first_name, ' ',um.middle_name, ' ',um.last_name) as name
              from users_master as um
              WHERE um.status = true
              ORDER BY um.id DESC;`;
    const data = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
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
exports.getEmpNameBankNotAdded = async function () {
  try {
    let query = {};
    query = `SELECT um.id, concat(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS name
              FROM users_master AS um
              LEFT JOIN users_bank_details ubd ON um.id = ubd.user_id
              WHERE um.status = true AND ubd.user_id IS NULL
              ORDER BY um.id DESC;;`;
    const data = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
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
exports.getEmpNameSalMasterNotAdded = async function () {
  try {
    let query = {};
    query = `SELECT um.id, concat(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS name
              FROM users_master AS um
              LEFT JOIN users_salary_details usd on um.id = usd.user_id 
              WHERE um.status = true AND usd.user_id IS NULL
              ORDER BY um.id DESC;`;
    const data = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
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

exports.getUserEmails = async function () {
  try {
    const query = `SELECT um.id, CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS name, um.email
                   FROM users_master AS um
                   WHERE um.status = true AND um.email IS NOT NULL AND um.email != ''
                   ORDER BY um.first_name ASC`;
    const data = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
exports.updateBiometricCode = async function (body) {
  try {
     await usersMaster.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Biometric Code Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Data";
    return responseCodes.BAD_REQUEST;
  }
};
exports.updateProfilePic = async function (body) {
  try {
     await usersMaster.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Biometric Code Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Data";
    return responseCodes.BAD_REQUEST;
  }
};
