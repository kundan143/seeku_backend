module.exports = function (sequelize, DataTypes) {
  let table_name = "employee_incentive_details";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    disbursed_month_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    modified_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    modified_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    deleted_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  };
  let optional = {
    sequelize,
    tableName: "employee_incentive_details",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
