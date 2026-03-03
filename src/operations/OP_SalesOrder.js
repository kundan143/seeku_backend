const { get_so_financial_year } = require("../services/commonServices");
const { salesOrder, relSalesOrderItems } = require("../models");
// const { addActivityLog } = require("../services/activityLog");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { Op, QueryTypes } = require("sequelize");
const { sequelize } = require("../config/database-connection");
const logger = require("../services/dailyLogService");
const rel_sales_order_items = require("../models/rel_sales_order_items");

exports.addData = async function (body) {
  const t = await sequelize.transaction();
  try {
    body.data["current_financial_year"] = get_so_financial_year();
    const result = await salesOrder.create(body.data, { transaction: t });

    if (Array.isArray(body.item_details) && body.item_details.length > 0) {
        const itemsToInsert = body.item_details.map((element) => ({
            so_id: result.id,
            item_id: element.item_id,
            quantity: element.quantity,
            uom_id: element.uom_id,
            material_requirement_date: new Date(element.material_requirement_date),
            rate: element.rate,
            amount: element.amount,
        }));

        await relSalesOrderItems.bulkCreate(itemsToInsert, { transaction: t });
    }

    // Optional: Update organization zone if needed
    // if (body.data.buyer_id && body.data.zone_id) {
    //   await organizationsMaster.update(
    //     { sales_zone_id: body.data.zone_id },
    //     { where: { id: body.data.buyer_id }, transaction: t }
    //   );
    // }

    // Commit transaction
    await t.commit();

    responseCodes.SUCCESS.data = result.id;
    responseCodes.SUCCESS.message = "Sales Order Added Successfully.";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.error("Error in addData:", e);
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Sales Order.";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateSalesItem = async function (body) {
  try {
    await salesOrders.update(body.data, {
      where: {
        id: body.id,
      },
    });
    await relSalesOrderGrade.destroy({
      where: {
        con_id: body.id,
      },
    });
    body.grades.forEach(async (element) => {
      let obj = {
        con_id: body.id,
        grade_id: element.grade_id,
        quantity: element.quantity,
        stuffing_quantity: element.stuffing_quantity,
        unit_type: element.unit_type,
        rate: element.rate,
        sales_hsn_code: element.sales_hsn_code,
        currency_id: element.currency_id,
        base_amount: element.base_amount,
        total_amount: element.base_amount,
        supplier_id: element.supplier_id,
        country_origin_id: element.country_origin_id,
        so_link_bal_qty: element.so_link_bal_qty,
      };
      await relSalesOrderGrade.create(obj);
    });
    // sendNotification('update_sales_order', body.id, body.data.modified_by);
    // addActivityLog(salesOrders.tableName, body.id, body, "UPDATE");
    responseCodes.SUCCESS.data = body.id;
    responseCodes.SUCCESS.message = "Row Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e, "ERROR");
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Row";
    return responseCodes.BAD_REQUEST;
  }
};
exports.updateData = async function (body) {
  try {
    await salesOrders.update(body.data, {
      where: {
        id: body.id,
      },
    });
    // addActivityLog(salesOrders.tableName, body.id, body, "UPDATE");
    responseCodes.SUCCESS.data = body.id;
    responseCodes.SUCCESS.message = "Row Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e, "ERROR");
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getAllData = async function (body) {
  try {
    let query = `select so.id as so_id, so.booking_date, so.current_financial_year,
                    om.org_name as buyer_name, so.buyer_address, ptm.payment_term  , cm."name" as city_name,
                    concat(um.first_name,' ', um.last_name) as kam_name,
                    concat(um2.first_name,' ', um2.last_name) as crm_name,
                    wctm.cable_type, so.remarks, im.item_name, rsoi.quantity, utm.uom_name,
                    rsoi.rate, rsoi.amount
                    from sales_order so
                    join rel_sales_order_items rsoi on rsoi.so_id = so.id
                    join item_master im on im.id = rsoi.item_id
                    join organizations_master om on om.id = so.org_id
                    join payment_term_master ptm on ptm.id = so.payment_term_id
                    join city_master cm on cm.id = so.delivery_city_id
                    join users_master um on um.id = so.sales_person_id
                    join users_master um2 on um2.id = so.crm_person_id
                    join wire_cable_types_master wctm on wctm.id = so.wire_cable_type_id
                    join unit_type_master utm on utm.id = rsoi.uom_id
                    order by so.id desc;`;

    let results = await sequelize.query(query, { type: QueryTypes.SELECT });
    console.log(results);
    responseCodes.SUCCESS.data = results;
    responseCodes.SUCCESS.message = "Data Retrieved Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e, "ERROR");
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Retrieve Data";
    return responseCodes.BAD_REQUEST;
  }
};
exports.getOneData = async function (id) {
  try {
    let query = `select so.id as so_id, so.booking_date, so.current_financial_year,
                    om.org_name as buyer_name, so.buyer_address, ptm.payment_term,
                    concat(um.first_name,' ', um.last_name) as kam_name, cm."name" as city_name,
                    concat(um2.first_name,' ', um2.last_name) as crm_name,
                    wctm.cable_type, so.remarks, im.item_name, rsoi.quantity, utm.uom_name,
                    rsoi.rate, rsoi.amount
                    from sales_order so
                    join rel_sales_order_items rsoi on rsoi.so_id = so.id
                    join item_master im on im.id = rsoi.item_id
                    join organizations_master om on om.id = so.org_id
                    join payment_term_master ptm on ptm.id = so.payment_term_id
                    join city_master cm on cm.id = so.delivery_city_id
                    join users_master um on um.id = so.sales_person_id
                    join users_master um2 on um2.id = so.crm_person_id
                    join wire_cable_types_master wctm on wctm.id = so.wire_cable_type_id
                    join unit_type_master utm on utm.id = rsoi.uom_id
                    where so.id = ${id}
                    order by so.id desc;`;

    let results = await sequelize.query(query, { type: QueryTypes.SELECT });
    console.log(results);
    responseCodes.SUCCESS.data = results;
    responseCodes.SUCCESS.message = "Data Retrieved Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e, "ERROR");
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Retrieve Data";
    return responseCodes.BAD_REQUEST;
  }
};
