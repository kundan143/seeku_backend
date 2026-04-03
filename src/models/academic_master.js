module.exports = function (sequelize, DataTypes) {
  let table_name = "academic_master";
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
    admission_no: { type: DataTypes.STRING(255), allowNull: false },
    admission_date: { type: DataTypes.DATEONLY, allowNull: true },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "class_master", key: "id" },
    },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "section_master", key: "id" },
    },
    roll_no: { type: DataTypes.STRING(255), allowNull: true },
    academic_year: { type: DataTypes.STRING(9), allowNull: false },
    previous_school: { type: DataTypes.STRING(255), allowNull: true },
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
    tableName: "academic_master",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
