module.exports = function (sequelize, DataTypes) {
    let table_name = "sales_order";
    let columns = {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
        },
        booking_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        so_no: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        current_financial_year: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        so_sequence_no: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        org_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "organizations_master",
                key: "id",
            },
        },
        buyer_address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        payment_term_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "payment_term_master",
                key: "id",
            },
        },
        delivery_city_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "city_master",
                key: "id",
            },
        },
        sales_person_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users_master",
                key: "id",
            },
        },
        crm_person_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users_master",
                key: "id",
            },
        },
        final_place_of_delivery: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        customer_email: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        wire_cable_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "wire_cable_types_master",
                key: "id",
            },
        },
        customer_mobile: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        remarks: {
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
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "users_master",
                key: "id",
            },
        },
    };
    let optional = {
        sequelize,
        tableName: "sales_order",
        schema: "public",
        timestamps: false,
    };
    return sequelize.define(table_name, columns, optional);
};
