const { materialMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require("sequelize");
// const { addActivityLog } = require("../services/activityLog");

exports.addData = async function (body) {
  try {
    var result = await materialMaster.create(body.data);
    responseCodes.SUCCESS.data = result.id;
    // addActivityLog(materialMaster.tableName, result.id, body, "ADD")
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
    await materialMaster.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    // addActivityLog(materialMaster.tableName, result.id, body, "UPDATE")
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
    await materialMaster.destroy({
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    // addActivityLog(materialMaster.tableName, result.id, body, "DELETE")
    responseCodes.SUCCESS.message = "Row Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getAllData = async function () {
  try {
    let query = ` select mm.id, mm.material_name, csm.stage_name as cable_stage_name, concat(utm.uom_name, ' (', utm.uom_code,')') as uom_name_with_code,
                        csm.id as cable_stage_id, mm.description,concat(utm.uom_name, ' (', utm.uom_code,')') as uom_name_with_code, concat(um.first_name, ' ', um.last_name ) as created_by, mm.created_date
                        from material_master mm
                        join cable_stage_master csm on csm.id = mm.cable_stage_id
                        join unit_type_master utm on utm.id = mm.uom_id
                        join users_master um on um.id = mm.created_by
                        where mm.status = 0
                        order by mm.id desc;`;
    let data = await sequelize.query(query, {
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

exports.getOneData = async function (id) {
  try {
    let query = ` select mm.id, mm.material_name, csm.stage_name as cable_stage_name, concat(utm.uom_name, ' (', utm.uom_code,')') as uom_name_with_code,
                        csm.id as cable_stage_id, mm.description, mm.uom_id,
                        concat(um.first_name, ' ', um.last_name ) as created_by, mm.created_date
                        from material_master mm
                        join cable_stage_master csm on csm.id = mm.cable_stage_id
                        join unit_type_master utm on utm.id = mm.uom_id
                        join users_master um on um.id = mm.created_by
                        where mm.status = 0 and mm.id = ${id}
                        order by mm.id desc;`;
    let data = await sequelize.query(query, {
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
exports.getMaterialByCableStage = async function (cable_stage_id) {
  try {
    let query = ` select mm.id, mm.material_name, csm.stage_name as cable_stage_name, concat(utm.uom_name, ' (', utm.uom_code,')') as uom_name_with_code,
                        csm.id as cable_stage_id, mm.description, mm.uom_id,
                        concat(um.first_name, ' ', um.last_name ) as created_by, mm.created_date
                        from material_master mm
                        join cable_stage_master csm on csm.id = mm.cable_stage_id
                        join unit_type_master utm on utm.id = mm.uom_id
                        join users_master um on um.id = mm.created_by
                        where mm.status = 0 and mm.cable_stage_id = ${cable_stage_id}
                        order by mm.id desc;`;
    let data = await sequelize.query(query, {
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
