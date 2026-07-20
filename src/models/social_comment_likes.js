module.exports = function (sequelize, DataTypes) {
  let table_name = "social_comment_likes";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    comment_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "social_post_comments", key: "id" },
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "users_master", key: "id" },
    },
    created_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  };
  let optional = {
    sequelize,
    tableName: "social_comment_likes",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
