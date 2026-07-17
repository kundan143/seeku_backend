const { quotation } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

exports.addData = async function (body) {
  try {
    const result = await quotation.create(body.data);
    responseCodes.SUCCESS.data = result.id;
    responseCodes.SUCCESS.message = "Quotation Added Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.error("Error adding quotation:", e);
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Quotation";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateData = async function (body) {
  try {
    await quotation.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = body.id;
    responseCodes.SUCCESS.message = "Quotation Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Quotation";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  try {
    await quotation.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Quotation Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Quotation";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getAllData = async function () {
  try {
    let query = `select q.*, q.status as status_name, om.org_name as buyer_name
                  from quotation q
                  join leads l on l.id = q.lead_id
                  join organizations_master om on om.id = l.org_id
                  where q.is_deleted = 0
                  order by q.id desc;`;
    let results = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = results;
    responseCodes.SUCCESS.message = "Data Retrieved Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Retrieve Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getOneData = async function (id) {
  try {
    let query = `select q.*, om.org_name as buyer_name
                  from quotation q
                  join leads l on l.id = q.lead_id
                  join organizations_master om on om.id = l.org_id
                  where q.id = :id;`;
    let results = await sequelize.query(query, { replacements: { id }, type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = results;
    responseCodes.SUCCESS.message = "Data Retrieved Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Retrieve Data";
    return responseCodes.BAD_REQUEST;
  }
};
