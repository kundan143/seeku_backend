const { productionDatasheet } = require("../models");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require("sequelize");

exports.addData = async function (body) {
  try {
    var result = await productionDatasheet.create(body.data);
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
    await productionDatasheet.update(body.data, {
      where: {
        id: body.id,
      },
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
    await productionDatasheet.update(body.data, {
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

exports.getAllData = async function () {
  try {
    let query = `	select ccm.category_name, wctm.cable_type,im.item_name,
                  concat(um.first_name,' ', um.last_name) as created_by, pd.* 
                  from production_datasheet pd 
                  join cable_category_master ccm on ccm.id = pd.cable_category_id 
                  join wire_cable_types_master wctm on wctm.id = pd.wire_cable_type_id 
                  join item_master im on im.id = pd.item_id 
                  join users_master um on um.id = pd.created_by 
                  where pd.is_active = 1 
                  order by pd.id desc;`;
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

exports.getOneData = async function (pd_id) {
  try {
    let query = `select pd.*,im.item_name, wctm.cable_type from production_datasheet pd
                  join item_master im on im.id = pd.item_id
                  join wire_cable_types_master wctm on wctm.id = pd.wire_cable_type_id
                  where im.is_deleted = 0 and pd.id = ${pd_id}`;
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

exports.getDatasheetDetails = async function (pd_id) {
  try {
    let conductorQuery = `	select * from conductor_information where pd_id = ${pd_id};`;
    let conductorData = await sequelize.query(conductorQuery, {
      type: QueryTypes.SELECT,
    });
    let insulationQuery = `	select * from insulation_information where pd_id = ${pd_id};`;
    let insulationData = await sequelize.query(insulationQuery, {
      type: QueryTypes.SELECT,
    });
    let pairingQuery = `	select * from pairing_information where pd_id = ${pd_id};`;
    let pairingData = await sequelize.query(pairingQuery, {
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = {
      conductor_information: conductorData,
      insulation_information: insulationData,
      pairing_information: pairingData,
    };
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e);
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.addStages = async function (body) {
  try {
    const { production_datasheet_id, stages, status } = body;

    // 🔥 Delete old
    await sequelize.query(`
      DELETE FROM production_datasheet_stages 
      WHERE production_datasheet_id = ${production_datasheet_id}
    `);

    // 🔥 Insert new
    for (let stage of stages) {
      await sequelize.query(`
        INSERT INTO production_datasheet_stages 
        (production_datasheet_id, stage_id, order_no)
        VALUES (${production_datasheet_id}, ${stage.stage_id}, ${stage.order_no})
      `);
    }

    // ✅ ONLY update status if all stages selected
    if (status === 0) {
      await sequelize.query(`
        UPDATE production_datasheet
        SET status = 0
        WHERE id = ${production_datasheet_id}
      `);
    }

    return responseCodes.SUCCESS;
  } catch (e) {
    return responseCodes.BAD_REQUEST;
  }
};

exports.getStages = async function (production_datasheet_id) {
  try {
    const data = await sequelize.query(`
      SELECT stage_id, order_no 
      FROM production_datasheet_stages 
      WHERE production_datasheet_id = ${production_datasheet_id}
      ORDER BY order_no
    `, { type: QueryTypes.SELECT });

    responseCodes.SUCCESS.data = data;
    return responseCodes.SUCCESS;
  } catch (e) {
    return responseCodes.BAD_REQUEST;
  }
};

exports.approveDatasheet = async function (body) {
  try {
    await productionDatasheet.update(
      {
        status: 1,
        approved_date: new Date(),
      },
      {
        where: { id: body.production_datasheet_id },
      },
    );

    return responseCodes.SUCCESS;
  } catch (e) {
    return responseCodes.BAD_REQUEST;
  }
};

exports.rejectDatasheet = async function (body) {
  try {
    await productionDatasheet.update(
      {
        status: 2,
      },
      {
        where: { id: body.production_datasheet_id },
      },
    );

    return responseCodes.SUCCESS;
  } catch (e) {
    return responseCodes.BAD_REQUEST;
  }
};