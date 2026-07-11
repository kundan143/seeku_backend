const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database-connection");
const m = require("./masters")
const dt = {};

dt.roleMaster = require("../role_master")(sequelize, DataTypes);
dt.menuMaster = require("../menu_master")(sequelize, DataTypes);
dt.menuPermission = require("../menu_permission")(sequelize, DataTypes);
dt.rolePermission = require("../role_permission")(sequelize, DataTypes);
dt.linkPermission = require("../link_permission")(sequelize, DataTypes);
dt.linkMaster = require("../link_master")(sequelize, DataTypes);
dt.userActivityLog = require("../user_activity_log")(sequelize, DataTypes);


dt.menuPermission.belongsTo(m.usersMaster, { foreignKey: "created_by" });
dt.menuPermission.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
dt.menuPermission.belongsTo(m.usersMaster, { foreignKey: "user_id" });
dt.menuPermission.belongsTo(m.roleMaster, { foreignKey: "role_id" });

dt.rolePermission.belongsTo(m.usersMaster, { foreignKey: "created_by" });
dt.rolePermission.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
dt.rolePermission.belongsTo(m.roleMaster, { foreignKey: "role_id" });
dt.rolePermission.belongsTo(dt.menuMaster, { foreignKey: "menu_id" });


dt.linkPermission.belongsTo(m.usersMaster, { foreignKey: "created_by" });
dt.linkPermission.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
dt.linkPermission.belongsTo(m.usersMaster, { foreignKey: "user_id" });
dt.linkPermission.belongsTo(m.roleMaster, { foreignKey: "role_id" });

dt.linkMaster.belongsTo(dt.menuMaster, { foreignKey: "menu_id" });

dt.userActivityLog.belongsTo(m.usersMaster, { foreignKey: "user_id" });


module.exports = dt;