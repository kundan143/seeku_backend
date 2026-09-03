module.exports = function (sequelize, DataTypes) {
  let table_name = "leave_encashment_history";
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
    leave_balance_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "user_leave_balance", key: "id" },
    },
    remaining_days_before: {
      type: DataTypes.NUMERIC(5, 2),
      allowNull: false,
    },
    encashed_days: {
      type: DataTypes.NUMERIC(5, 2),
      allowNull: false,
    },
    per_day_amount: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
    },
    encashment_amount: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  };
  let optional = {
    sequelize,
    tableName: "leave_encashment_history",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
