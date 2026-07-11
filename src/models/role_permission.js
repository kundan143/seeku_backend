module.exports = function (sequelize, DataTypes) {
  let table_name = "role_permission";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "role_master", key: "id" },
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
    excel_opt: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    pdf_opt: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    approve_opt: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    mailsent_opt: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
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
    tableName: "role_permission",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
