const { employeeAssets } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

exports.getAllData = async function () {
  try {
    var query = `select am.id as asset_id, an.field_value as asset_name, am.asset_code,
                    cat.field_value as category_name,
                    ea.id as assignment_id, ea.user_id as assigned_to,
                    CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) as assigned_to_name,
                    ea.assigned_date, ea.remarks as assignment_remarks
                  from asset_master am
                  left join dropdown_value_master an on an.id = am.asset_name_id
                  left join dropdown_value_master cat on cat.id = am.category_id
                  left join employee_assets ea on ea.asset_id = am.id and ea.status = 1 and ea.is_deleted = 0
                  left join users_master um on um.id = ea.user_id
                  where am.is_deleted = 0
                  order by am.id asc;`;
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

exports.assignAsset = async function (body) {
  try {
    var result = await employeeAssets.create(body.data);
    responseCodes.SUCCESS.data = result.id;
    responseCodes.SUCCESS.message = "Asset Assigned Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = e?.parent?.code === '23505'
      ? "This asset is already assigned to someone."
      : "Failed to Assign Asset";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  try {
    await employeeAssets.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Assignment Record Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Assignment Record";
    return responseCodes.BAD_REQUEST;
  }
};

exports.returnAsset = async function (body) {
  try {
    await employeeAssets.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Asset Returned Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Return Asset";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getByUser = async function (user_id) {
  try {
    var query = `select am.id as asset_id, an.field_value as asset_name, am.asset_code,
                    cat.field_value as category_name, ea.assigned_date, ea.remarks
                  from employee_assets ea
                  join asset_master am on am.id = ea.asset_id
                  left join dropdown_value_master an on an.id = am.asset_name_id
                  left join dropdown_value_master cat on cat.id = am.category_id
                  where ea.user_id = :user_id and ea.status = 1 and ea.is_deleted = 0 and am.is_deleted = 0
                  order by ea.assigned_date desc;`;
    var data = await sequelize.query(query, { replacements: { user_id }, type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getHistory = async function (asset_id) {
  try {
    var query = `select ea.*, CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) as assigned_to_name
                  from employee_assets ea
                  join users_master um on um.id = ea.user_id
                  where ea.asset_id = :asset_id and ea.is_deleted = 0
                  order by ea.assigned_date desc, ea.id desc;`;
    var data = await sequelize.query(query, { replacements: { asset_id }, type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load History";
    return responseCodes.BAD_REQUEST;
  }
};
