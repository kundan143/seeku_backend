const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database-connection");
// const dt = require("./developer_tools");
const m = {};

m.usersMaster = require("../users_master")(sequelize, DataTypes);
m.countryMaster = require("../country_master")(sequelize, DataTypes);
m.genderMaster = require("../gender_master")(sequelize, DataTypes);
m.maritalStatusMaster = require("../marital_status_master")(sequelize, DataTypes);
m.bloodGroupMaster = require("../blood_group_master")(sequelize, DataTypes);
m.empTypeMaster = require("../emp_type_master")(sequelize, DataTypes);
m.roleMaster = require("../role_master")(sequelize, DataTypes);
m.stateMaster = require("../state_master")(sequelize, DataTypes);
m.cityMaster = require("../city_master")(sequelize, DataTypes);
m.designationMaster = require("../designation_master")(sequelize, DataTypes);
m.departmentMaster = require("../department_master")(sequelize, DataTypes);
m.wireCableTypesMaster = require("../wire_cable_types_master")(sequelize, DataTypes);
m.cableCategoryMaster = require("../cable_category_master")(sequelize, DataTypes);
m.cableStageMaster = require("../cable_stage_master")(sequelize, DataTypes);
m.unitTypeMaster = require("../unit_type_master")(sequelize, DataTypes);
m.materialMaster = require("../material_master")(sequelize, DataTypes);
m.paymentTermMaster = require("../payment_term_master")(sequelize, DataTypes);
m.itemMaster = require("../item_master")(sequelize, DataTypes);
m.relationMaster = require("../relation_master")(sequelize, DataTypes);
m.bankMaster = require("../bank_master")(sequelize, DataTypes);
m.leaveTypeMaster = require("../leave_type_master")(sequelize, DataTypes);
m.expenseTypeMaster = require("../expense_type_master")(sequelize, DataTypes);
m.classMaster = require("../class_master")(sequelize, DataTypes);
m.sectionMaster = require("../section_master")(sequelize, DataTypes);
m.studentMaster = require("../student_master")(sequelize, DataTypes);
m.studentParentsMaster = require("../student_parents_master")(sequelize, DataTypes);
m.studentDocument = require("../student_document")(sequelize, DataTypes);
m.emailMaster = require("../email_master")(sequelize, DataTypes);
m.mobileMaster = require("../mobile_master")(sequelize, DataTypes);
m.addressMaster = require("../address_master")(sequelize, DataTypes);
m.academicMaster = require("../academic_master")(sequelize, DataTypes);
m.subjectMaster = require("../subject_master")(sequelize, DataTypes);
m.feeTypeMaster = require("../fee_type_master")(sequelize, DataTypes);

// Relations
// m.usersMaster.belongsTo(dt.roleMaster, { foreignKey: 'role_id' });
m.usersMaster.belongsTo(m.designationMaster, { foreignKey: 'designation_id' });
m.usersMaster.belongsTo(m.departmentMaster, { foreignKey: 'department_id' });
m.usersMaster.belongsTo(m.usersMaster, { as: 'reporting_manager', foreignKey: 'reporting_manager_id' });
m.usersMaster.belongsTo(m.genderMaster, { foreignKey: 'gender_id' });
m.usersMaster.belongsTo(m.bloodGroupMaster, { foreignKey: 'blood_group_id' });
m.usersMaster.belongsTo(m.empTypeMaster, { foreignKey: 'emp_type_id' });
m.usersMaster.belongsTo(m.maritalStatusMaster, { foreignKey: 'marital_status_id' });
m.usersMaster.belongsTo(m.countryMaster, { foreignKey: 'nationality_id' });
m.usersMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.usersMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });


m.countryMaster.hasMany(m.stateMaster, { foreignKey: 'country_id' });
m.stateMaster.belongsTo(m.countryMaster, { foreignKey: 'country_id' });

m.stateMaster.hasMany(m.cityMaster, { foreignKey: 'state_id' });
m.cityMaster.belongsTo(m.stateMaster, { foreignKey: 'state_id' });

m.wireCableTypesMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.wireCableTypesMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
m.wireCableTypesMaster.belongsTo(m.cableCategoryMaster, { foreignKey: 'cable_category_id' });

m.cableCategoryMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.cableCategoryMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });

m.cableStageMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.cableStageMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
m.cableStageMaster.belongsTo(m.wireCableTypesMaster, { foreignKey: 'wire_cable_type_id' });

m.unitTypeMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.unitTypeMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });

m.materialMaster.belongsTo(m.cableStageMaster, { foreignKey: 'cable_stage_id' });
m.materialMaster.belongsTo(m.unitTypeMaster, { foreignKey: 'uom_id' });
m.materialMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.materialMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });

m.paymentTermMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.paymentTermMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
m.paymentTermMaster.belongsTo(m.usersMaster, { as: 'approved_by_user', foreignKey: 'approved_by' });
m.paymentTermMaster.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });

m.itemMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.itemMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
m.itemMaster.belongsTo(m.usersMaster, { as: 'approved_by_user', foreignKey: 'approved_by' });
m.itemMaster.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });


m.relationMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.relationMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
m.relationMaster.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });

m.bankMaster.belongsTo(m.usersMaster, { foreignKey: 'created_by' });
m.bankMaster.belongsTo(m.usersMaster, { foreignKey: 'modified_by' });
m.bankMaster.belongsTo(m.usersMaster, { foreignKey: 'deleted_by' });


m.leaveTypeMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.leaveTypeMaster.belongsTo(m.usersMaster, { as: 'updated_by_user', foreignKey: 'updated_by' });
m.leaveTypeMaster.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });


m.expenseTypeMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.expenseTypeMaster.belongsTo(m.usersMaster, { as: 'updated_by_user', foreignKey: 'modified_by' });
m.expenseTypeMaster.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });

m.classMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.classMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
m.classMaster.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });

m.sectionMaster.belongsTo(m.classMaster, { foreignKey: 'class_id' });
m.sectionMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.sectionMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
m.sectionMaster.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });

m.studentMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.studentMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
m.studentMaster.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });

m.studentParentsMaster.belongsTo(m.studentMaster, { foreignKey: 'st_id' });
m.studentParentsMaster.belongsTo(m.relationMaster, { foreignKey: 'relation_id' });
m.studentParentsMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.studentParentsMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
m.studentParentsMaster.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });

m.studentDocument.belongsTo(m.studentMaster, { foreignKey: 'st_id' });
m.studentDocument.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.studentDocument.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
m.studentDocument.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });

m.emailMaster.belongsTo(m.usersMaster, { foreignKey: 'emp_id' });
m.emailMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.emailMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
m.emailMaster.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });

m.mobileMaster.belongsTo(m.usersMaster, { foreignKey: 'emp_id' });
m.mobileMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.mobileMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
m.mobileMaster.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });

m.addressMaster.belongsTo(m.usersMaster, { foreignKey: 'emp_id' });
m.addressMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.addressMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
m.addressMaster.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });


m.subjectMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.subjectMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
m.subjectMaster.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });


m.feeTypeMaster.belongsTo(m.usersMaster, { as: 'created_by_user', foreignKey: 'created_by' });
m.feeTypeMaster.belongsTo(m.usersMaster, { as: 'modified_by_user', foreignKey: 'modified_by' });
m.feeTypeMaster.belongsTo(m.usersMaster, { as: 'deleted_by_user', foreignKey: 'deleted_by' });




module.exports = m;