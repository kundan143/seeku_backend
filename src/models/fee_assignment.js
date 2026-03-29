module.exports = function (sequelize, DataTypes) {
  let table_name = "fee_assignment";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    st_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "student_master", key: "id" },
    },
    fee_structure_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "fee_structure", key: "id" },
    },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    discount_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
    final_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: true },
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
    tableName: "fee_assignment",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
