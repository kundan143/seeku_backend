module.exports = function (sequelize, DataTypes) {
  let table_name = "armoring_information";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    pd_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "production_datasheet",
        key: "id",
      },
    },
    armoring_material_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "material_master",
        key: "id",
      },
    },
    size_of_wire_strips: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    number_of_wire_strips: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    diameter_over_armouring: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    coverage: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    is_deleted: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
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
      allowNull: false,
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
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    approved_date: {
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
    tableName: "armoring_information",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
