const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database-connection");
const m = require("./masters")
const fm = {};


fm.feeStructure = require("../fee_structure")(sequelize, DataTypes);
fm.feeAssignment = require("../fee_assignment")(sequelize, DataTypes);

fm.feeStructure.belongsTo(m.usersMaster, { foreignKey: "created_by" });
fm.feeStructure.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
fm.feeStructure.belongsTo(m.usersMaster, { foreignKey: "deleted_by" });


fm.feeAssignment.belongsTo(m.usersMaster, { foreignKey: "created_by" });
fm.feeAssignment.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
fm.feeAssignment.belongsTo(m.usersMaster, { foreignKey: "deleted_by" });

module.exports = fm;