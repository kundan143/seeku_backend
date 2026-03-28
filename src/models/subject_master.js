module.exports = function (sequelize, DataTypes) {
  let table_name = "subject_master";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    subject_name: { type: DataTypes.STRING(255), allowNull: false },
    subject_code: { type: DataTypes.STRING(255), allowNull: true },
    subject_type: { type: DataTypes.STRING(255), allowNull: true },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "class_master", key: "id" },
    },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "section_master", key: "id" },
    },
    description: { type: DataTypes.TEXT, allowNull: true },
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
    tableName: "subject_master",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
