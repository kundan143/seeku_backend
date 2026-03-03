module.exports = function (sequelize, DataTypes) {
  let table_name = "pairing_information";
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
    pairing_color: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    pairing_lay: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    pairing_lay_tolerance: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    back_twist: {
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
    tableName: "pairing_information",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
