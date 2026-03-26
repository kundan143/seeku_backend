module.exports = function (sequelize, DataTypes) {
  let table_name = "class_master";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    class_name: { type: DataTypes.STRING(255), allowNull: false },
    class_code: { type: DataTypes.STRING(255), allowNull: true },
    description: { type: DataTypes.STRING(255), allowNull: true },
    is_active: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
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
    tableName: "class_master",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
