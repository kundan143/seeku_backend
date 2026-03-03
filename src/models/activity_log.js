module.exports = function (sequelize, DataTypes) {
  let table_name = "activity_log";
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
      references: {
        model: "users_master",
        key: "id",
      },
    },
    table_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    row_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    activity: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    params: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    host: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    method: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    api_path: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  };
  let optional = {
    sequelize,
    tableName: "activity_log",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
