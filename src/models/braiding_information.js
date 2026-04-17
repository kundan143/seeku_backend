module.exports = function (sequelize, DataTypes) {
  let table_name = "braiding_information";
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
    polyester_tape: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    almyar_tape: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    material_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "material_master",
        key: "id",
      },
    },
    no_of_wires: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    wire_size: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    drain_wire_material_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "material_master",
        key: "id",
      },
    },
    drain_wire_size: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    diameter: {
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
      references: { model: "users_master", key: "id" },
    },
    created_date: { type: DataTypes.DATE, allowNull: false },
    modified_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users_master", key: "id" },
    },
    modified_date: { type: DataTypes.DATE, allowNull: true },
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
    tableName: "braiding_information",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
