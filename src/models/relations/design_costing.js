const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database-connection");
const m = require("../relations/masters");
const s = require("../relations/sales");
const o = require("./organizations");

// DESIGN COSTING MODELS

const dc = {};
dc.productionDatasheet = require("../production_datasheet")(sequelize, DataTypes);
dc.conductorInformation = require("../conductor_information")(sequelize, DataTypes);
dc.insulationInformation = require("../insulation_information")(sequelize, DataTypes);
dc.pairingInformation = require("../pairing_information")(sequelize, DataTypes);
dc.armoringInformation = require("../armoring_information")(sequelize, DataTypes);
dc.braidingInformation = require("../braiding_information")(sequelize, DataTypes);
dc.innerSheathingInformation = require("../inner_sheathing_information")(sequelize, DataTypes);
dc.outerSheathingInformation = require("../outer_sheathing_information")(sequelize, DataTypes);
dc.laidUpInformation = require("../laid_up_information")(sequelize, DataTypes);
dc.productionDatasheetStages = require("../production_datasheet_stages")(sequelize, DataTypes);

// RELATIONSHIPS

dc.productionDatasheet.hasMany(dc.conductorInformation, { foreignKey: "rel_so_id" });
dc.productionDatasheet.hasMany(dc.insulationInformation, { foreignKey: "rel_so_id" });
dc.productionDatasheet.hasMany(dc.pairingInformation, { foreignKey: "rel_so_id" });
dc.productionDatasheet.hasMany(dc.armoringInformation, { foreignKey: "rel_so_id" });
dc.productionDatasheet.hasMany(dc.braidingInformation, { foreignKey: "rel_so_id" });
dc.productionDatasheet.hasMany(dc.innerSheathingInformation, { foreignKey: "rel_so_id" });
dc.productionDatasheet.hasMany(dc.outerSheathingInformation, { foreignKey: "rel_so_id" });
dc.productionDatasheet.hasMany(dc.laidUpInformation, { foreignKey: "rel_so_id" });

dc.armoringInformation.belongsTo(s.salesOrder, { foreignKey: "rel_so_id" });
// dc.armoringInformation.belongsTo(dc.materialMaster, { foreignKey: "armoring_material_id" });
dc.armoringInformation.belongsTo(m.usersMaster, { foreignKey: "created_by" });
dc.armoringInformation.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
dc.armoringInformation.belongsTo(m.usersMaster, { foreignKey: "deleted_by" });
dc.armoringInformation.belongsTo(m.usersMaster, { foreignKey: "approved_by" });

dc.braidingInformation.belongsTo(s.salesOrder, { foreignKey: "rel_so_id" });
dc.braidingInformation.belongsTo(m.materialMaster, { foreignKey: "material_id" });
dc.braidingInformation.belongsTo(m.materialMaster, { foreignKey: "drain_wire_material_id" });
dc.braidingInformation.belongsTo(m.usersMaster, { foreignKey: "created_by" });
dc.braidingInformation.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
dc.braidingInformation.belongsTo(m.usersMaster, { foreignKey: "deleted_by" });
dc.braidingInformation.belongsTo(m.usersMaster, { foreignKey: "approved_by" });

dc.innerSheathingInformation.belongsTo(s.salesOrder, { foreignKey: "rel_so_id" });
// dc.innerSheathingInformation.belongsTo(dc.materialMaster, { foreignKey: "inner_sheathing_material_id" });
dc.innerSheathingInformation.belongsTo(m.usersMaster, { foreignKey: "created_by" });
dc.innerSheathingInformation.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
dc.innerSheathingInformation.belongsTo(m.usersMaster, { foreignKey: "deleted_by" });
dc.innerSheathingInformation.belongsTo(m.usersMaster, { foreignKey: "approved_by" });

dc.outerSheathingInformation.belongsTo(s.salesOrder, { foreignKey: "rel_so_id" });
// dc.outerSheathingInformation.belongsTo(dc.materialMaster, { foreignKey: "outer_sheathing_material_id" });
dc.outerSheathingInformation.belongsTo(m.usersMaster, { foreignKey: "created_by" });
dc.outerSheathingInformation.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
dc.outerSheathingInformation.belongsTo(m.usersMaster, { foreignKey: "deleted_by" });
dc.outerSheathingInformation.belongsTo(m.usersMaster, { foreignKey: "approved_by" });

dc.laidUpInformation.belongsTo(s.salesOrder, { foreignKey: "rel_so_id" });
// dc.laidUpInformation.belongsTo(dc.materialMaster, { foreignKey: "laid_up_material_id" });
dc.laidUpInformation.belongsTo(m.usersMaster, { foreignKey: "created_by" });
dc.laidUpInformation.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
dc.laidUpInformation.belongsTo(m.usersMaster, { foreignKey: "deleted_by" });
dc.laidUpInformation.belongsTo(m.usersMaster, { foreignKey: "approved_by" });

dc.conductorInformation.belongsTo(s.salesOrder, { foreignKey: "rel_so_id" });
// dc.conductorInformation.belongsTo(dc.materialMaster, { foreignKey: "conductor_material_id" });
dc.conductorInformation.belongsTo(m.usersMaster, { foreignKey: "created_by" });
dc.conductorInformation.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
dc.conductorInformation.belongsTo(m.usersMaster, { foreignKey: "deleted_by" });
dc.conductorInformation.belongsTo(m.usersMaster, { foreignKey: "approved_by" });

dc.insulationInformation.belongsTo(s.salesOrder, { foreignKey: "rel_so_id" });
// dc.insulationInformation.belongsTo(dc.materialMaster, { foreignKey: "insulation_material_id" });
dc.insulationInformation.belongsTo(m.usersMaster, { foreignKey: "created_by" });
dc.insulationInformation.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
dc.insulationInformation.belongsTo(m.usersMaster, { foreignKey: "deleted_by" });
dc.insulationInformation.belongsTo(m.usersMaster, { foreignKey: "approved_by" });


dc.pairingInformation.belongsTo(s.salesOrder, { foreignKey: "rel_so_id" });
// dc.pairingInformation.belongsTo(dc.materialMaster, { foreignKey: "pairing_material_id" });
dc.pairingInformation.belongsTo(m.usersMaster, { foreignKey: "created_by" });
dc.pairingInformation.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
dc.pairingInformation.belongsTo(m.usersMaster, { foreignKey: "deleted_by" });
dc.pairingInformation.belongsTo(m.usersMaster, { foreignKey: "approved_by" });



dc.productionDatasheet.belongsTo(m.itemMaster, { foreignKey: "item_id" });
dc.productionDatasheet.belongsTo(m.cableCategoryMaster, { foreignKey: "cable_category_id" });
dc.productionDatasheet.belongsTo(m.wireCableTypesMaster, { foreignKey: "wire_cable_type_id" });
dc.productionDatasheet.belongsTo(m.usersMaster, { foreignKey: "created_by" });
dc.productionDatasheet.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
dc.productionDatasheet.belongsTo(m.usersMaster, { foreignKey: "deleted_by" });
dc.productionDatasheet.belongsTo(m.usersMaster, { foreignKey: "approved_by" });


dc.productionDatasheetStages.belongsTo(dc.productionDatasheet, { foreignKey: "datasheet_id" });
dc.productionDatasheetStages.belongsTo(m.cableStageMaster, { foreignKey: "stage_id" });
dc.productionDatasheetStages.belongsTo(m.usersMaster, { foreignKey: "created_by" });
dc.productionDatasheetStages.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
dc.productionDatasheetStages.belongsTo(m.usersMaster, { foreignKey: "deleted_by" });

module.exports = dc;