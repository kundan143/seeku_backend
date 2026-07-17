module.exports = function (sequelize, DataTypes) {
  let table_name = "asset_master";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    asset_name_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "dropdown_value_master",
        key: "id",
      },
    },
    asset_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "dropdown_value_master",
        key: "id",
      },
    },
    serial_number: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    brand_model_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "dropdown_value_master",
        key: "id",
      },
    },
    specifications: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    asset_condition: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    invoice_number: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    purchase_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    purchase_value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "organizations_master",
        key: "id",
      },
    },
    warranty_expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    is_deleted: {
      type: DataTypes.INTEGER,
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
      allowNull: true,
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
    tableName: "asset_master",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
