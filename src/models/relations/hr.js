const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database-connection");
const m = require("./masters");
const h = {};


h.emergencyContacts = require("../emergency_contacts")(sequelize, DataTypes);
h.usersBankDetails = require("../users_bank_details")(sequelize, DataTypes);
h.usersSalaryDetails = require("../users_salary_details")(sequelize, DataTypes);
h.userLeavesDetails = require("../users_leave_details")(sequelize, DataTypes);
h.employeeExpenses = require("../employee_expense")(sequelize, DataTypes);
h.holidaysMaster = require("../holidays_master")(sequelize, DataTypes);


h.emergencyContacts.belongsTo(m.usersMaster, { foreignKey: 'user_id' });
h.emergencyContacts.belongsTo(m.relationMaster, { foreignKey: 'relation_id' });


h.usersBankDetails.belongsTo(m.usersMaster, { foreignKey: 'user_id' });
h.usersBankDetails.belongsTo(m.bankMaster, { foreignKey: 'bank_id' });
h.usersBankDetails.belongsTo(m.usersMaster, { foreignKey: 'created_by' });
h.usersBankDetails.belongsTo(m.usersMaster, { foreignKey: 'updated_by' });

h.usersSalaryDetails.belongsTo(m.usersMaster, { foreignKey: 'user_id' });
h.usersSalaryDetails.belongsTo(m.usersMaster, { foreignKey: 'created_by' });
h.usersSalaryDetails.belongsTo(m.usersMaster, { foreignKey: 'updated_by' });


h.userLeavesDetails.belongsTo(m.usersMaster, { foreignKey: 'user_id' });
h.userLeavesDetails.belongsTo(m.leaveTypeMaster, { foreignKey: 'leave_type_id' });
h.userLeavesDetails.belongsTo(m.usersMaster, { as: 'approved_by_user', foreignKey: 'approved_by' });
h.userLeavesDetails.belongsTo(m.usersMaster, { as: 'rejected_by_user', foreignKey: 'rejected_by' });
h.userLeavesDetails.belongsTo(m.usersMaster, { foreignKey: 'created_by' });
h.userLeavesDetails.belongsTo(m.usersMaster, { foreignKey: 'updated_by' });
h.userLeavesDetails.belongsTo(m.usersMaster, { foreignKey: 'deleted_by' });

h.employeeExpenses.belongsTo(m.usersMaster, { foreignKey: 'employee_id' });
h.employeeExpenses.belongsTo(m.expenseTypeMaster, { foreignKey: 'expense_type_id' });
h.employeeExpenses.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
h.employeeExpenses.belongsTo(m.usersMaster, { as: 'updated_by_user', foreignKey: 'modified_by' });
h.employeeExpenses.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });

h.holidaysMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
h.holidaysMaster.belongsTo(m.usersMaster, { as: 'updated_by_user', foreignKey: 'modified_by' });
h.holidaysMaster.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });


module.exports = h;