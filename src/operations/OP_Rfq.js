const { rfq } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

async function generateRfqNumber() {
  const rows = await sequelize.query("select nextval('rfq_code_seq') as seq", { type: QueryTypes.SELECT });
  return 'RFQ-' + String(rows[0].seq).padStart(6, '0');
}

exports.addData = async function (body) {
  try {
    body.data.rfq_number = await generateRfqNumber();
    const result = await rfq.create(body.data);
    responseCodes.SUCCESS.data = result.id;
    responseCodes.SUCCESS.message = "RFQ Added Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add RFQ";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateData = async function (body) {
  try {
    delete body.data.rfq_number;
    await rfq.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = body.id;
    responseCodes.SUCCESS.message = "RFQ Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update RFQ";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  try {
    await rfq.update({
      is_deleted: 1,
      deleted_by: body.deleted_by,
      deleted_date: new Date(),
    }, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "RFQ Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete RFQ";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getAllData = async function () {
  try {
    let query = `select r.*, om.org_name as buyer_name,
                    concat(um.first_name, ' ', um.last_name) as created_by_name
                  from rfq r
                  join organizations_master om on om.id = r.org_id
                  left join users_master um on um.id = r.created_by
                  where r.is_deleted = 0
                  order by r.id desc;`;
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
    let query = `select r.*, om.org_name as buyer_name
                  from rfq r
                  join organizations_master om on om.id = r.org_id
                  where r.id = :id;`;
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
