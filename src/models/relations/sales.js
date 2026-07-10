const {DataTypes} = require("sequelize");
const {sequelize} = require("../../config/database-connection");
const m = require("./masters");
const o = require("./organizations");
const s = {};
s.salesOrder = require("../sales_order")(sequelize, DataTypes);
s.relSalesOrderItems = require("../rel_sales_order_items")(sequelize, DataTypes);
s.leads = require("../leads")(sequelize, DataTypes);
s.leadHistory = require("../lead_history")(sequelize, DataTypes);
s.leadTrackingLog = require("../lead_tracking_log")(sequelize, DataTypes);

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

s.leads.belongsTo(o.organizationsMaster, {foreignKey: 'org_id'});
s.leads.belongsTo(m.stageMaster, {foreignKey: 'stage_id'});
s.leads.belongsTo(m.usersMaster, {as: 'assigned_to_user', foreignKey: 'assigned_to'});
s.leads.belongsTo(m.usersMaster, {as: 'created_by_user', foreignKey: 'created_by'});
s.leads.belongsTo(m.usersMaster, {as: 'modified_by_user', foreignKey: 'modified_by'});

s.leadHistory.belongsTo(s.leads, {foreignKey: 'lead_id'});
s.leadHistory.belongsTo(m.usersMaster, {as: 'created_by_user', foreignKey: 'created_by'});

s.leadTrackingLog.belongsTo(s.leads, {foreignKey: 'lead_id'});
s.leadTrackingLog.belongsTo(m.stageMaster, {foreignKey: 'stage_id'});
s.leadTrackingLog.belongsTo(m.usersMaster, {as: 'created_by_user', foreignKey: 'created_by'});


module.exports = s;