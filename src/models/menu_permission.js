module.exports = function (sequelize, DataTypes) {
  let table_name = "menu_permission";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users_master", key: "id" },
    },
    menu_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "menu_master", key: "id" },
    },
    add_opt: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    edit_opt: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    view_opt: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    delete_opt: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
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
    created_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
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
    tableName: "menu_permission",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
