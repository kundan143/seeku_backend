module.exports = function (sequelize, DataTypes) {
  let table_name = "users_bank_details";
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
    bank_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "bank_master", key: "id" },
    },
    account_number: { type: DataTypes.STRING(255), allowNull: false },
    ifsc_code: { type: DataTypes.STRING(255), allowNull: false },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users_master", key: "id" },
    },
    created_date: { type: DataTypes.DATE, allowNull: true },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    updated_date: { type: DataTypes.DATE, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
    comment: { type: DataTypes.TEXT, allowNull: true },
  };
  let optional = {
    sequelize,
    tableName: "users_bank_details",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
