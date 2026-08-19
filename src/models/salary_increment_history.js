module.exports = function (sequelize, DataTypes) {
  let table_name = "salary_increment_history";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    salary_detail_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "users_salary_details",
        key: "id",
      },
    },
    increment_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    increment_value: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
    },
    effective_from: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    disbursement_month: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
    disbursement_year: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
    arrear_months: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    da_arrear_months: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    standard_lop_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    da_lop_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_arrear_amount: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    arrear_paid_status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0,
    },
    old_salary_snapshot: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    new_salary_snapshot: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_reverted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    reverted_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    reverted_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
    },
    created_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
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
      type: DataTypes.BIGINT,
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
      type: DataTypes.BIGINT,
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
    tableName: "salary_increment_history",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
