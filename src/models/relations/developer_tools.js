const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database-connection");
const m = require("./masters")
const dt = {};
dt.roleMaster = require("../role_master")(sequelize, DataTypes);
dt.menuMaster = require("../menu_master")(sequelize, DataTypes);
dt.menuPermission = require("../menu_permission")(sequelize, DataTypes);
dt.linkPermission = require("../link_permission")(sequelize, DataTypes);


dt.menuPermission.belongsTo(m.usersMaster, { foreignKey: "created_by" });
dt.menuPermission.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
dt.menuPermission.belongsTo(m.usersMaster, { foreignKey: "user_id" });
dt.menuPermission.belongsTo(m.designationMaster, { foreignKey: "designation_id" });


dt.linkPermission.belongsTo(m.usersMaster, { foreignKey: "created_by" });
dt.linkPermission.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
dt.linkPermission.belongsTo(m.usersMaster, { foreignKey: "user_id" });
dt.linkPermission.belongsTo(m.designationMaster, { foreignKey: "designation_id" });


module.exports = dt;