module.exports = function (sequelize, DataTypes) {
  let table_name = "users_salary_details";
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
    basic_salary: { type: DataTypes.DECIMAL(10, 3), allowNull: true, defaultValue: 0 },
    hra: { type: DataTypes.DECIMAL(10, 3), allowNull: true, defaultValue: 0 },
    conveyance: { type: DataTypes.DECIMAL(10, 3), allowNull: true, defaultValue: 0 },
    medical_allowance: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      defaultValue: 0,
    },
    special_allowance: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      defaultValue: 0,
    },
    bonus: { type: DataTypes.DECIMAL(10, 3), allowNull: true, defaultValue: 0 },
    pf_employer: { type: DataTypes.DECIMAL(10, 3), allowNull: true, defaultValue: 0 },
    pf_employee: { type: DataTypes.DECIMAL(10, 3), allowNull: true, defaultValue: 0 },
    esi_employer: { type: DataTypes.DECIMAL(10, 3), allowNull: true, defaultValue: 0 },
    esi_employee: { type: DataTypes.DECIMAL(10, 3), allowNull: true, defaultValue: 0 },
    professional_tax: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      defaultValue: 0,
    },
    other_deduction: { type: DataTypes.DECIMAL(10, 3), allowNull: true, defaultValue: 0 },
    gross_salary: { type: DataTypes.DECIMAL(10, 3), allowNull: true, defaultValue: 0 },
    net_salary: { type: DataTypes.DECIMAL(10, 3), allowNull: true, defaultValue: 0 },
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
  };
  let optional = {
    sequelize,
    tableName: "users_salary_details",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
