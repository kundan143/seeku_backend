module.exports = function (sequelize, DataTypes) {
  let table_name = "candidate_offer_history";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    candidate_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "candidates",
        key: "id",
      },
    },
    old_snapshot: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    new_snapshot: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    old_letter_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    modified_by: {
      type: DataTypes.BIGINT,
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
  };
  let optional = {
    sequelize,
    tableName: "candidate_offer_history",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
