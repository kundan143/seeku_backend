module.exports = function (sequelize, DataTypes) {
  let table_name = "leave_bulk_credit_log";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    leave_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "leave_type_master", key: "id" },
    },
    credit_days: {
      type: DataTypes.NUMERIC(5, 1),
      allowNull: false,
    },
    credited_month: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    credited_year: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    employees_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: "leave_bulk_credit_log",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
