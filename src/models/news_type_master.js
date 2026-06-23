module.exports = function (sequelize, DataTypes) {
  let table_name = "news_type_master";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.SMALLINT, allowNull: true, defaultValue: 1 },
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
    tableName: "news_type_master",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
