module.exports = function (sequelize, DataTypes) {
  let table_name = "loan_advance_request";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    amount: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    deduction_months: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Postgres GENERATED ALWAYS ... STORED column (amount / deduction_months) —
    // never write to this field, the database computes and rejects explicit inserts.
    monthly_deduction_amount: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: true,
    },
    total_paid: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    attachment_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "loan_advance_request",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
