module.exports = function (sequelize, DataTypes) {
  let table_name = "increment_letter_mail_log";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    salary_increment_history_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "salary_increment_history",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.BIGINT,
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
    letter_url: {
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
    tableName: "increment_letter_mail_log",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
