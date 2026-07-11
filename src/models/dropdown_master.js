module.exports = function (sequelize, DataTypes) {
  let table_name = "dropdown_master";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    menu_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "menu_master", key: "id" },
    },
    field_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    is_deleted: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users_master", key: "id" },
    },
    created_date: { type: DataTypes.DATE, allowNull: false },
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
    tableName: "dropdown_master",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
