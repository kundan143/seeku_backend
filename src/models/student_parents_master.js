module.exports = function (sequelize, DataTypes) {
  let table_name = "student_parents_master";
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
    relation_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: true },
    first_name: { type: DataTypes.STRING(255), allowNull: false },
    middle_name: { type: DataTypes.STRING(255), allowNull: true },
    last_name: { type: DataTypes.STRING(255), allowNull: true },
    gender_id: { type: DataTypes.INTEGER, allowNull: true },
    mobile_no: { type: DataTypes.STRING(255), allowNull: true },
    email_id: { type: DataTypes.STRING(255), allowNull: true },
    is_primary_guardian: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
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
    tableName: "student_parents_master",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
