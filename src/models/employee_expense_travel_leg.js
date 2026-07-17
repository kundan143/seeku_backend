module.exports = function (sequelize, DataTypes) {
  let table_name = "employee_expense_travel_leg";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    employee_expense_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "employee_expense",
        key: "id",
      },
    },
    from_location_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "city_master",
        key: "id",
      },
    },
    to_location_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "city_master",
        key: "id",
      },
    },
    purpose: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    vehicle_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    distance_km: {
      type: DataTypes.NUMERIC(10, 2),
      allowNull: false,
    },
    rate_per_km: {
      type: DataTypes.NUMERIC(10, 2),
      allowNull: false,
    },
    sub_total: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  };
  let optional = {
    sequelize,
    tableName: "employee_expense_travel_leg",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
