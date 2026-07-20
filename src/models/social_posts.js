module.exports = function (sequelize, DataTypes) {
  let table_name = "social_posts";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    content: { type: DataTypes.TEXT, allowNull: false },
    image_paths: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: true },
    share_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1 },
    created_by: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "users_master", key: "id" },
    },
    created_date: { type: DataTypes.DATE, allowNull: true },
    modified_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    modified_date: { type: DataTypes.DATE, allowNull: true },
    deleted_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    deleted_date: { type: DataTypes.DATE, allowNull: true },
  };
  let optional = {
    sequelize,
    tableName: "social_posts",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
