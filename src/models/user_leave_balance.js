module.exports = function (sequelize, DataTypes) {
  let table_name = "user_leave_balance";
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
    leave_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "leave_type_master", key: "id" },
    },
    year: { type: DataTypes.INTEGER, allowNull: true },
    allocated_days: { type: DataTypes.NUMERIC(5, 1), allowNull: true },
    used_days: {
      type: DataTypes.NUMERIC(5, 1),
      allowNull: true,
      defaultValue: 0,
    },
    remaining_days: { type: DataTypes.NUMERIC(5, 1), allowNull: true },
    carry_forward_days: {
      type: DataTypes.NUMERIC(5, 1),
      allowNull: true,
      defaultValue: 0,
    },
    status: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
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
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    deleted_date: { type: DataTypes.DATE, allowNull: true },
  };
  let optional = {
    sequelize,
    tableName: "user_leave_balance",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
