module.exports = function (sequelize, DataTypes) {
  let table_name = "conductor_information";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    rel_so_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "rel_sales_order_items",
        key: "id",
      },
    },
    conductor_material_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "material_master",
        key: "id",
      },
    },
    no_of_cores: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    strands_per_core: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    size_per_strands: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    elongation: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    resistance: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    wire_size_tolerance: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    lay_length: {
      type: DataTypes.DECIMAL(10, 3),
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
    tableName: "conductor_information",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
