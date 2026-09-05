module.exports = function (sequelize, DataTypes) {
  let table_name = "custom_mail_log";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    recipient_email: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    cc: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    bcc: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attachment_urls: {
      type: DataTypes.TEXT,
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
    tableName: "custom_mail_log",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
