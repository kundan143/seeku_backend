module.exports = function (sequelize, DataTypes) {
    let table_name = "rel_sales_order_items";
    let columns = {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
        },
        so_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "sales_order",
                key: "id"
            },
        },
        item_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "item_master",
                key: "id"
            },
        },
        quantity: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
        uom_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "unit_type_master",
                key: "id"
            },
        },
        material_requirement_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        rate: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
        amount: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        }
    };
    let optional = {
        sequelize,
        tableName: "rel_sales_order_items",
        schema: "public",
        timestamps: false,
    };
    return sequelize.define(table_name, columns, optional);
};
