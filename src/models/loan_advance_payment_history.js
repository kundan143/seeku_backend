module.exports = function (sequelize, DataTypes) {
  let table_name = "loan_advance_payment_history";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    loan_advance_request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "loan_advance_request",
        key: "id",
      },
    },
    amount: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
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
  };
  let optional = {
    sequelize,
    tableName: "loan_advance_payment_history",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
