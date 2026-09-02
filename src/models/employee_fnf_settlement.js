module.exports = function (sequelize, DataTypes) {
  let table_name = "employee_fnf_settlement";
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
    salary_detail_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "users_salary_details", key: "id" },
    },
    last_working_day: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    years_of_service: {
      type: DataTypes.NUMERIC(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    pending_salary_days: {
      type: DataTypes.NUMERIC(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    pending_salary_amount: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    leave_encashment_breakdown: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    leave_encashment_amount: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    gratuity_eligible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    gratuity_amount: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    loan_recovery_breakdown: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    loan_recovery_amount: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    notice_period_required_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    notice_period_served_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    notice_shortfall_amount: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    other_additions: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    other_deductions: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gross_earnings: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total_deductions: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    net_payable: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.SMALLINT,
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
    modified_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    modified_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    finalized_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    finalized_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  };
  let optional = {
    sequelize,
    tableName: "employee_fnf_settlement",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
