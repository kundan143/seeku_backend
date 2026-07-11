module.exports = function (sequelize, DataTypes) {
    let table_name = "leads";
    let columns = {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
        },
        lead_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        due_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        source_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "dropdown_value_master",
                key: "id",
            },
        },
        lead_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "dropdown_value_master",
                key: "id",
            },
        },
        lead_kind_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "dropdown_value_master",
                key: "id",
            },
        },
        stage_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            references: {
                model: "stage_master",
                key: "id",
            },
        },
        org_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "organizations_master",
                key: "id",
            },
        },
        email: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: false,
            defaultValue: [],
        },
        phone: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: false,
            defaultValue: [],
        },
        enquiry_details: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: false,
            defaultValue: [],
        },
        lead_documents: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: true,
            defaultValue: [],
        },
        assigned_to: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "users_master",
                key: "id",
            },
        },
        estimated_value: {
            type: DataTypes.DOUBLE,
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
    };
    let optional = {
        sequelize,
        tableName: "leads",
        schema: "public",
        timestamps: false,
    };
    return sequelize.define(table_name, columns, optional);
};
