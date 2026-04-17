module.exports = function (sequelize, DataTypes) {
  let table_name = "insulation_information";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    pd_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "production_datasheet",
        key: "id",
      },
    },
    insulation_material_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "material_master",
        key: "id",
      },
    },
    color: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    thichkess_nom: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    insulation_tolerance: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    overall_dia: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    dia_tolerance: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    master_batch: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    spark_test: {
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
    tableName: "insulation_information",
    schema: "public",
    timestamps: false,
    indexes: [
      {
        name: "insulation_information_pkey",
        unique: true,
        fields: [{ name: "id" }],
      },
    ],
  };
  return sequelize.define(table_name, columns, optional);
};
