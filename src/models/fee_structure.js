module.exports = function (sequelize, DataTypes) {
  let table_name = "fee_structure";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "class_master", key: "id" },
    },
    fee_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "fee_type_master", key: "id" },
    },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    frequency: { type: DataTypes.STRING(255), allowNull: false },
    academic_year: { type: DataTypes.STRING(255), allowNull: false },
    due_day: { type: DataTypes.INTEGER, allowNull: true },
    late_fee_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
    is_active: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    created_date: { type: DataTypes.DATE, allowNull: true },
    modified_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    modified_date: { type: DataTypes.DATE, allowNull: true },
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    deleted_date: { type: DataTypes.DATE, allowNull: true },
  };
  let optional = {
    sequelize,
    tableName: "fee_structure",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
