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
    await productionDatasheet.destroy({
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
    let query = `	select pi.details AS pairing_details, ci.details AS conductor_details, ii.details AS insulation_details, so.id as so_id,rsoi.id as rel_so_id, so.booking_date, so.current_financial_year,ccm.category_name,
                    om.org_name as buyer_name, so.buyer_address, ptm.payment_term  , cm."name" as city_name,
                    concat(um.first_name,' ', um.last_name) as kam_name,rsoi.rate, rsoi.amount,
                    concat(um2.first_name,' ', um2.last_name) as crm_name,so.wire_cable_type_id,
                    wctm.cable_type, so.remarks, im.item_name, rsoi.quantity, utm.uom_name
                    from sales_order so
                    join rel_sales_order_items rsoi on rsoi.so_id = so.id
                    join item_master im on im.id = rsoi.item_id
                    join organizations_master om on om.id = so.org_id
                    join payment_term_master ptm on ptm.id = so.payment_term_id
                    join city_master cm on cm.id = so.delivery_city_id
                    join users_master um on um.id = so.sales_person_id
                    join users_master um2 on um2.id = so.crm_person_id
                    join wire_cable_types_master wctm on wctm.id = so.wire_cable_type_id
                    join cable_category_master ccm on ccm.id = wctm.id
                    join unit_type_master utm on utm.id = rsoi.uom_id
                    LEFT JOIN (
                        SELECT json_agg(row_to_json(t)) AS details, rel_so_id
                        FROM conductor_information t
                        GROUP BY rel_so_id
                    ) ci ON ci.rel_so_id = rsoi.id
                    LEFT JOIN (
                        SELECT json_agg(row_to_json(t)) AS details, rel_so_id
                        FROM insulation_information t
                        GROUP BY rel_so_id
                    ) ii ON ii.rel_so_id = rsoi.id
                    LEFT JOIN (
                        SELECT json_agg(row_to_json(t)) AS details, rel_so_id
                        FROM pairing_information t
                        GROUP BY rel_so_id
                    ) pi ON pi.rel_so_id = rsoi.id
                    order by so.id desc;`;
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

exports.getOneData = async function (rel_so_id) {
  try {
    let query = `	select om.org_name, im.item_name, so.so_no, wctm.cable_type
                from rel_sales_order_items rsoi
                join sales_order so on so.id = rsoi.so_id
                join organizations_master om on om.id = so.org_id
                join item_master im on im.id = rsoi.item_id
                join wire_cable_types_master wctm on wctm.id = so.wire_cable_type_id
                where rsoi.id = ${rel_so_id} and so.is_deleted = 0;`;
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

exports.getDatasheetDetails = async function (rel_so_id) {
  try {
    let conductorQuery = `	select * from conductor_information where rel_so_id = ${rel_so_id};`;
    let conductorData = await sequelize.query(conductorQuery, {
      type: QueryTypes.SELECT,
    });
    let insulationQuery = `	select * from insulation_information where rel_so_id = ${rel_so_id};`;
    let insulationData = await sequelize.query(insulationQuery, {
      type: QueryTypes.SELECT,
    });
    let pairingQuery = `	select * from pairing_information where rel_so_id = ${rel_so_id};`;
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
