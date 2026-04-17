module.exports = function (sequelize, DataTypes) {
let table_name = "wire_cable_types_master";
let columns = {
    id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
    },
    cable_category_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    cable_type: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_active: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "users_master",
            key: "id"
        },
    },
    created_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    modified_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "users_master",
            key: "id"
        }
    },
    modified_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
    };
let optional = {
    sequelize,
    tableName: "wire_cable_types_master",
    schema: "public",
    timestamps: false,
    indexes: [
        {
            name: "wire_cable_types_master_pkey",
            unique: true,
            fields: [
                { name: "id" },
            ]
        },
    ]
};
    return sequelize.define(table_name, columns, optional);
};
