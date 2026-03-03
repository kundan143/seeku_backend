const {DataTypes} = require("sequelize");
const {sequelize} = require("../../config/database-connection");
const m = require("./masters");
const o = require("./organizations");
const s = {};
s.salesOrder = require("../sales_order")(sequelize, DataTypes);
s.relSalesOrderItems = require("../rel_sales_order_items")(sequelize, DataTypes);

// Relations

s.salesOrder.belongsTo(o.organizationsMaster, {foreignKey: 'org_id'});
s.salesOrder.belongsTo(m.paymentTermMaster, {foreignKey: 'payment_term_id'});
s.salesOrder.belongsTo(m.cityMaster, {foreignKey: 'delivery_city_id'});
s.salesOrder.belongsTo(m.usersMaster, {as: 'sales_person', foreignKey: 'sales_person_id'});
s.salesOrder.belongsTo(m.usersMaster, {as: 'crm_person', foreignKey: 'crm_person_id'});
s.salesOrder.belongsTo(m.wireCableTypesMaster, {foreignKey: 'wire_cable_type_id'});
s.salesOrder.belongsTo(m.usersMaster, {as: 'created_by_user', foreignKey: 'created_by'});
s.salesOrder.belongsTo(m.usersMaster, {as: 'updated_by_user', foreignKey: 'updated_by'});


s.relSalesOrderItems.belongsTo(m.itemMaster, {foreignKey: 'item_id'});
s.relSalesOrderItems.belongsTo(s.salesOrder, { foreignKey: 'so_id'});
s.relSalesOrderItems.belongsTo(m.unitTypeMaster, {foreignKey: 'uom_id'});


module.exports = s;