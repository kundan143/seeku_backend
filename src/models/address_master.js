module.exports = function (sequelize, DataTypes) {
  let table_name = "address_master";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    st_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "student_master", key: "id" },
    },
    emp_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    add_1: { type: DataTypes.STRING(255), allowNull: false },
    add_2: { type: DataTypes.STRING(255), allowNull: true },
    landmark: { type: DataTypes.STRING(255), allowNull: true },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "city_master", key: "id" },
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "state_master", key: "id" },
    },
    country_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "country_master", key: "id" },
    },
    pincode: { type: DataTypes.STRING(255), allowNull: true },
    is_active: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: "address_master",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
