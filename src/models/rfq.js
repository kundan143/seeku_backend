module.exports = function (sequelize, DataTypes) {
  let table_name = "rfq";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    rfq_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    org_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "organizations_master", key: "id" },
    },
    lead_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "leads", key: "id" },
    },
    cable_type: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cable_standard: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    conductor_size: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    no_of_core: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    conductor_material: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    insulation_material: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    voltage_grade: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    operating_temperature: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    customer_specification: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    special_requirement: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pd_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "production_datasheet", key: "id" },
    },
    ai_design: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    ai_design_generated_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ai_design_updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    ai_design_updated_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    is_deleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users_master", key: "id" },
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    modified_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    modified_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    deleted_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  };
  let optional = {
    sequelize,
    tableName: "rfq",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
