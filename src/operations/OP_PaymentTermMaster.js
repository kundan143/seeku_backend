const { paymentTermMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require("sequelize");

exports.addData = async function (body) {
  try {
    var result = await paymentTermMaster.create(body.data);
    // if (result && result.id) {
    //   body.data.ptm_id = result.id;
    //   await logPaymentTermMaster.create(body.data);
    // }
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
    await paymentTermMaster.update(body.data, {
      where: {
        id: body.id,
      },
    });
    // const latestRecord = await logPaymentTermMaster.findOne({
    //   where: {
    //     ptm_id: body.id,
    //   },
    //   order: [["id", "DESC"]],
    // });

    // if (latestRecord) {
    //   await logPaymentTermMaster.update(body.data, {
    //     where: {
    //       id: latestRecord.id,
    //     },
    //   });
    // }

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
    await paymentTermMaster.destroy({
      where: {
        id: body.id,
      },
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

exports.getAllData = async function (body) {
  try {
    let query = ``;
    let status = ``;
    if (body.status != null && body.status != undefined) {
      status = `WHERE ptm.status = ${body.status}`;
    }
    query = `select concat(um.first_name, ' ', um.last_name) as added_by, 
				 concat(um2.first_name, ' ', um2.last_name) as modified_name, 
				 (CASE
				 	WHEN (ptm.payment_method = 1) THEN 'TT'
				 	WHEN (ptm.payment_method = 2) THEN 'LC'
				 	ELSE '-'
				 	END
				 ) AS payment_method_name,
				(CASE
					WHEN (ptm.type = 1) THEN 'Sales'
					ELSE '-'
					END
				) AS type_name,
				(case
					WHEN (ptm.status = 0) THEN 'Waiting for Approval'
					WHEN (ptm.status = 1) THEN 'Approved'
					WHEN (ptm.status = 2) THEN 'Rejected'
					ELSE '-'
					END
				) AS status_name, ptm.*
				from payment_term_master ptm 
				left join users_master um on um.id = ptm.created_by 
				left join users_master um2 on um2.id = ptm.modified_by 
				${status}
				order by ptm.id desc`;
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
    var data = await paymentTermMaster.findAll({
      where: {
        id: id,
      },
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

exports.getTypeWisePaymentTerms = async function (type) {
  try {
    var data = await paymentTermMaster.findAll({
      where: {
        type: type,
        status: 1,
      },
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

exports.getMethodWisePaymentTerms = async function (body) {
  try {
    const excludedPaymentTerms = [29, 50, 49]; //Wrong Payment Terms which are linked

    var data = await paymentTermMaster.findAll({
      where: {
        type: body.type,
        payment_method: body.payment_method,
        status: 1,
        id: {
          [Op.notIn]: excludedPaymentTerms,
        },
      },
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
