module.exports = function (sequelize, DataTypes) {
  let table_name = "production_datasheet_stages";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    stage_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "cable_stage_master", key: "id" },
    },
    order_no: { type: DataTypes.INTEGER, allowNull: false },
    production_datasheet_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "production_datasheet", key: "id" },
    },
    status: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users_master", key: "id" },
    },
    created_date: { type: DataTypes.DATE, allowNull: true },
    modified_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    modified_date: { type: DataTypes.DATE, allowNull: true },
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    deleted_date: { type: DataTypes.DATE, allowNull: true },
  };
  let optional = {
    sequelize,
    tableName: "production_datasheet_stages",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
