const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database-connection");
const m = require("../relations/masters");
const o = {};

// ORGANIZATIONS MODELS
o.organizationsMaster = require("../organizations_master")(sequelize, DataTypes);
// o.relOrgUsers = require("../rel_org_users")(sequelize, DataTypes);
o.orgAddresses = require("../org_addresses")(sequelize, DataTypes);
o.orgCategoriesMaster = require("../org_categories_master")(sequelize, DataTypes);
o.relOrgCategories = require("../rel_org_categories")(sequelize, DataTypes);
o.orgBankMaster = require("../org_bank_master")(sequelize, DataTypes);
o.orgContactPerson = require("../org_contact_person")(sequelize, DataTypes);
o.orgContactNumbers = require("../org_contact_numbers")(sequelize, DataTypes);
o.orgContactEmail = require("../org_contact_email")(sequelize, DataTypes);
// o.relOrgDocumentType = require("../rel_org_document_type")(sequelize, DataTypes);

// Organizations Master Relation
o.organizationsMaster.belongsTo(m.usersMaster, { foreignKey: "sales_zone_id" });
o.organizationsMaster.belongsTo(m.usersMaster, { foreignKey: "created_by" });
o.organizationsMaster.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
o.organizationsMaster.hasMany(o.orgAddresses, { foreignKey: "org_id" });
o.organizationsMaster.hasMany(o.orgContactEmail, { foreignKey: "org_id" });
o.organizationsMaster.hasMany(o.orgContactNumbers, { foreignKey: "org_id" });

// Organization Address Relation
o.orgAddresses.belongsTo(o.organizationsMaster, { foreignKey: "org_id" });
o.orgAddresses.belongsTo(m.usersMaster, { foreignKey: "created_by" });
o.orgAddresses.belongsTo(m.usersMaster, { foreignKey: "modified_by" });
o.orgAddresses.belongsTo(m.countryMaster, { foreignKey: "country_id" });
o.orgAddresses.belongsTo(m.stateMaster, { foreignKey: "state_id" });
o.orgAddresses.belongsTo(m.cityMaster, { foreignKey: "city_id" });

// Organization Contact Relation
o.orgContactPerson.belongsTo(m.designationMaster, { foreignKey: "designation_id" });
o.orgContactPerson.belongsTo(o.orgAddresses, { foreignKey: "org_address_id" });
o.orgContactNumbers.belongsTo(o.orgContactPerson, { foreignKey: "cont_id" });
o.orgContactNumbers.belongsTo(o.organizationsMaster, { foreignKey: "org_id" });
o.orgContactEmail.belongsTo(o.orgContactPerson, { foreignKey: "cont_id" });
o.orgContactEmail.belongsTo(o.organizationsMaster, { foreignKey: "org_id" });
o.orgContactPerson.hasMany(o.orgContactNumbers, { foreignKey: "cont_id" });
o.orgContactPerson.hasMany(o.orgContactEmail, { foreignKey: "cont_id" });


// Organization Category Relation
o.relOrgCategories.belongsTo(o.organizationsMaster, { foreignKey: "org_id" });
o.organizationsMaster.hasMany(o.relOrgCategories, { foreignKey: "org_id" });
o.relOrgCategories.belongsTo(o.orgCategoriesMaster, { foreignKey: "org_cat_id" });



// Organization Document Relation
// o.relOrgDocumentType.belongsTo(o.organizationsMaster, { foreignKey: "org_id" });
// o.relOrgDocumentType.belongsTo(m.documentTypeMaster, { foreignKey: "doc_type_id" });

//Organization and Contact Email Realtion
o.orgContactEmail.belongsTo(o.organizationsMaster, { foreignKey: "org_id" });
o.organizationsMaster.hasMany(o.orgContactEmail, { foreignKey: "org_id" });


module.exports = o;