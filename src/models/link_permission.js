module.exports = function (sequelize, DataTypes) {
  let table_name = "link_permission";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    link_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "link_master", key: "id" },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users_master", key: "id" },
    },
    access: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    designation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "designation_master", key: "id" },
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    created_date: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW, },
    is_active: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    modified_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    modified_date: { type: DataTypes.DATE, allowNull: true },
  };
  let optional = {
    sequelize,
    tableName: "link_permission",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
