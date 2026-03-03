const { wireCableTypesMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require("sequelize");
// const { addActivityLog } = require("../services/activityLog");

exports.addData = async function (body) {
  try {
    var result = await wireCableTypesMaster.create(body.data);
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
    await wireCableTypesMaster.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    // addActivityLog(stateMaster.tableName, result.id, body, "UPDATE")
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
    await wireCableTypesMaster.destroy({
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    // addActivityLog(stateMaster.tableName, result.id, body, "DELETE")
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
    let query = `SELECT wctm.id, ccm.category_name, wctm.cable_type, wctm.description,
                    CONCAT(um.first_name,' ', um.last_name) as name
                    FROM wire_cable_types_master wctm
                    JOIN cable_category_master ccm ON ccm.id = wctm.cable_category_id
                    JOIN users_master um ON um.id = wctm.created_by
                    ORDER BY wctm.id ASC;`;
    let data = await sequelize.query(query, { type: QueryTypes.SELECT });
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
    // var data = await wireCableTypesMaster.findAll({
    //     where: {
    //         id: id
    //     }
    // });
    let query = `SELECT wctm.id, ccm.category_name, wctm.cable_type, wctm.description,
                    CONCAT(um.first_name,' ', um.last_name) AS name, wctm.cable_category_id
                    FROM wire_cable_types_master wctm
                    JOIN cable_category_master ccm ON ccm.id = wctm.cable_category_id
                    JOIN users_master um ON um.id = wctm.created_by
                    WHERE wctm.id = ${id}
                    ORDER BY wctm.id ASC;`;
    let data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
exports.getDataUsingCableCategory = async function (cat_id) {
  try {
    let query = `SELECT wctm.id, ccm.category_name, wctm.cable_type, wctm.description,
                    CONCAT(um.first_name,' ', um.last_name) AS name, wctm.cable_category_id
                    FROM wire_cable_types_master wctm
                    JOIN cable_category_master ccm ON ccm.id = wctm.cable_category_id
                    JOIN users_master um ON um.id = wctm.created_by
                    WHERE wctm.cable_category_id = ${cat_id}
                    ORDER BY wctm.id ASC;`;
    let data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
