const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database-connection");
const m = require("./masters");
const h = {};


h.emergencyContacts = require("../emergency_contacts")(sequelize, DataTypes);
h.usersBankDetails = require("../users_bank_details")(sequelize, DataTypes);
h.usersSalaryDetails = require("../users_salary_details")(sequelize, DataTypes);
h.salaryPayment = require("../salary_payment")(sequelize, DataTypes);
h.userLeavesDetails = require("../users_leave_details")(sequelize, DataTypes);
h.employeeExpenses = require("../employee_expense")(sequelize, DataTypes);
h.employeeExpenseTravelLegs = require("../employee_expense_travel_leg")(sequelize, DataTypes);
h.holidaysMaster = require("../holidays_master")(sequelize, DataTypes);
h.companyNewsMaster = require("../company_news")(sequelize, DataTypes);
h.userLeaveBalance = require("../user_leave_balance")(sequelize, DataTypes);
h.userDocumentMaster = require("../user_document_master")(sequelize, DataTypes);
h.candidates = require("../candidates")(sequelize, DataTypes);
h.employeeAssets = require("../employee_assets")(sequelize, DataTypes);
h.attendancePunches = require("../attendance_punches")(sequelize, DataTypes);
h.attendanceRegularization = require("../attendance_regularization")(sequelize, DataTypes);
h.attendancePolicy = require("../attendance_policy")(sequelize, DataTypes);
h.hrPolicy = require("../hr_policy")(sequelize, DataTypes);
h.medicalInsurance = require("../medical_insurance")(sequelize, DataTypes);
h.socialPosts = require("../social_posts")(sequelize, DataTypes);
h.socialPostLikes = require("../social_post_likes")(sequelize, DataTypes);
h.socialPostComments = require("../social_post_comments")(sequelize, DataTypes);


h.emergencyContacts.belongsTo(m.usersMaster, { foreignKey: 'user_id' });
h.emergencyContacts.belongsTo(m.relationMaster, { foreignKey: 'relation_id' });


h.usersBankDetails.belongsTo(m.usersMaster, { foreignKey: 'user_id' });
h.usersBankDetails.belongsTo(m.bankMaster, { foreignKey: 'bank_id' });
h.usersBankDetails.belongsTo(m.usersMaster, { foreignKey: 'created_by' });
h.usersBankDetails.belongsTo(m.usersMaster, { foreignKey: 'updated_by' });

h.usersSalaryDetails.belongsTo(m.usersMaster, { foreignKey: 'user_id' });
h.usersSalaryDetails.belongsTo(m.usersMaster, { foreignKey: 'created_by' });
h.usersSalaryDetails.belongsTo(m.usersMaster, { foreignKey: 'modified_by' });
h.usersSalaryDetails.belongsTo(m.usersMaster, { foreignKey: 'deleted_by' });

h.salaryPayment.belongsTo(m.usersMaster, { foreignKey: 'user_id' });
h.salaryPayment.belongsTo(h.usersSalaryDetails, { foreignKey: 'salary_detail_id' });
h.salaryPayment.belongsTo(m.usersMaster, { foreignKey: 'created_by' });
h.salaryPayment.belongsTo(m.usersMaster, { foreignKey: 'modified_by' });
h.salaryPayment.belongsTo(m.usersMaster, { foreignKey: 'deleted_by' });


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

h.employeeExpenseTravelLegs.belongsTo(h.employeeExpenses, { foreignKey: 'employee_expense_id' });
h.employeeExpenseTravelLegs.belongsTo(m.cityMaster, { as: 'from_city', foreignKey: 'from_location_id' });
h.employeeExpenseTravelLegs.belongsTo(m.cityMaster, { as: 'to_city', foreignKey: 'to_location_id' });

h.holidaysMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
h.holidaysMaster.belongsTo(m.usersMaster, { as: 'updated_by_user', foreignKey: 'modified_by' });
h.holidaysMaster.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });


h.companyNewsMaster.belongsTo(m.newsTypeMaster, { foreignKey: 'news_type_id' });
h.companyNewsMaster.belongsTo(m.departmentMaster, { foreignKey: 'department_id' });
h.companyNewsMaster.belongsTo(m.priorityMaster, { foreignKey: 'priority_id' });
h.companyNewsMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
h.companyNewsMaster.belongsTo(m.usersMaster, { as: 'updated_by_user', foreignKey: 'modified_by' });
h.companyNewsMaster.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });


h.userLeaveBalance.belongsTo(m.usersMaster, { foreignKey: 'user_id' });
h.userLeaveBalance.belongsTo(m.leaveTypeMaster, { foreignKey: 'leave_type_id' });
h.userLeaveBalance.belongsTo(m.usersMaster, { foreignKey: 'created_by' });
h.userLeaveBalance.belongsTo(m.usersMaster, { foreignKey: 'updated_by' });
h.userLeaveBalance.belongsTo(m.usersMaster, { foreignKey: 'deleted_by' });

h.userDocumentMaster.belongsTo(m.usersMaster, { foreignKey: 'user_id' });
h.userDocumentMaster.belongsTo(m.usersMaster, { as: 'created_by_user',  foreignKey: 'created_by' });
h.userDocumentMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
h.userDocumentMaster.belongsTo(m.usersMaster, { as: 'deleted_by_user',  foreignKey: 'deleted_by' });

h.candidates.belongsTo(m.departmentMaster, { foreignKey: 'department_id' });
h.candidates.belongsTo(m.designationMaster, { foreignKey: 'designation_id' });
h.candidates.belongsTo(m.usersMaster, { as: 'reporting_manager', foreignKey: 'reporting_manager_id' });
h.candidates.belongsTo(m.usersMaster, { as: 'converted_user',    foreignKey: 'converted_user_id' });
h.candidates.belongsTo(m.usersMaster, { as: 'created_by_user',   foreignKey: 'created_by' });
h.candidates.belongsTo(m.usersMaster, { as: 'modified_by_user',  foreignKey: 'modified_by' });
h.candidates.belongsTo(m.usersMaster, { as: 'deleted_by_user',   foreignKey: 'deleted_by' });

h.employeeAssets.belongsTo(m.assetMaster, { foreignKey: 'asset_id' });
h.employeeAssets.belongsTo(m.usersMaster, { foreignKey: 'user_id' });
h.employeeAssets.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
h.employeeAssets.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });

h.attendancePunches.belongsTo(m.usersMaster, { foreignKey: 'user_id' });
h.attendancePunches.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
h.attendancePunches.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });

h.attendanceRegularization.belongsTo(m.usersMaster, { foreignKey: 'user_id' });
h.attendanceRegularization.belongsTo(m.usersMaster, { as: 'approved_by_user', foreignKey: 'approved_by' });
h.attendanceRegularization.belongsTo(m.usersMaster, { as: 'rejected_by_user', foreignKey: 'rejected_by' });
h.attendanceRegularization.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });

h.attendancePolicy.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
h.attendancePolicy.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });

h.hrPolicy.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
h.hrPolicy.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
h.hrPolicy.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });

h.medicalInsurance.belongsTo(m.usersMaster, { as: 'employee', foreignKey: 'employee_id' });
h.medicalInsurance.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
h.medicalInsurance.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
h.medicalInsurance.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });

h.socialPosts.belongsTo(m.usersMaster, { as: 'author', foreignKey: 'created_by' });
h.socialPosts.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
h.socialPosts.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });

h.socialPostLikes.belongsTo(h.socialPosts, { foreignKey: 'post_id' });
h.socialPostLikes.belongsTo(m.usersMaster, { foreignKey: 'user_id' });

h.socialPostComments.belongsTo(h.socialPosts, { foreignKey: 'post_id' });
h.socialPostComments.belongsTo(m.usersMaster, { as: 'author', foreignKey: 'created_by' });
h.socialPostComments.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
h.socialPostComments.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });


module.exports = h;