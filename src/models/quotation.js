module.exports = function (sequelize, DataTypes) {
    let table_name = "quotation";
    let columns = {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
        },
        lead_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "leads",
                key: "id",
            },
        },
        quotation_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        valid_until: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        total_amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        status: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 1,
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
    };
    let optional = {
        sequelize,
        tableName: "quotation",
        schema: "public",
        timestamps: false,
    };
    return sequelize.define(table_name, columns, optional);
};
