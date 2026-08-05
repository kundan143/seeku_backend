module.exports = function (sequelize, DataTypes) {
  let table_name = "salary_slip_mail_log";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    salary_payment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "salary_payments",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    recipient_email: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    payment_month: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
    payment_year: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
    slip_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
    },
    sent_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    sent_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  };
  let optional = {
    sequelize,
    tableName: "salary_slip_mail_log",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
