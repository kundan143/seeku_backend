module.exports = function (sequelize, DataTypes) {
  let table_name = "student_master";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    first_name: { type: DataTypes.STRING(255), allowNull: false },
    middle_name: { type: DataTypes.STRING(255), allowNull: true },
    last_name: { type: DataTypes.STRING(255), allowNull: false },
    gender_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "gender_master", key: "id" },
    },
    st_no: { type: DataTypes.STRING(255), allowNull: true },
    sequence_no: { type: DataTypes.INTEGER, allowNull: true },
    date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
    blood_group_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "blood_group_master", key: "id" },
    },
    photo_url: { type: DataTypes.STRING(255), allowNull: true },
    category_id: { type: DataTypes.INTEGER, allowNull: true },
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
    tableName: "student_master",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
