module.exports = function (sequelize, DataTypes) {
  let table_name = "material_master";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    material_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    cable_stage_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "cable_stage_master",
        key: "id"
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    uom_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "unit_type_master",
        key: "id"
      },
    },
    status: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users_master",
        key: "id"
      },
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    modified_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users_master",
        key: "id"
      },
    },
    modified_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
  };
  let optional = {
    sequelize,
    tableName: "material_master",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
