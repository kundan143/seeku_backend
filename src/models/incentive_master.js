module.exports = function (sequelize, DataTypes) {
  let table_name = "incentive_master";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    incentive_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    incentive_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "dropdown_value_master",
        key: "id",
      },
    },
    value_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "flat",
    },
    incentive_value: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
    },
    incentive_amount: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: true,
    },
    frequency: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "yearly",
    },
    // Informational only - HR's note of the expected payout month. NOT read by the accrual cron.
    disbursement_month: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    last_accrued_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    last_accrued_period: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "department_master",
        key: "id",
      },
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    modified_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    modified_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    deleted_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  };
  let optional = {
    sequelize,
    tableName: "incentive_master",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
