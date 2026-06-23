module.exports = function (sequelize, DataTypes) {
  let table_name = "company_news";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    news_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "news_type_master", key: "id" },
    },
    description: { type: DataTypes.TEXT, allowNull: true },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "department_master", key: "id" },
    },
    priority_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "priority_master", key: "id" },
    },
    published_date: { type: DataTypes.DATEONLY, allowNull: true },
    exp_date: { type: DataTypes.DATEONLY, allowNull: true },
    attachment: { type: DataTypes.TEXT, allowNull: true },
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
    tableName: "company_news",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
