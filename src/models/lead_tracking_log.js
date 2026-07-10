module.exports = function (sequelize, DataTypes) {
    let table_name = 'lead_tracking_log';
    let columns = {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true
        },
        lead_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'leads',
                key: 'id'
            }
        },
        stage_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'stage_master',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 1
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        is_deleted: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users_master',
                key: 'id'
            }
        },
        created_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        modified_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users_master',
                key: 'id'
            }
        },
        modified_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
    };
    let optional = {
        sequelize,
        tableName: 'lead_tracking_log',
        schema: 'public',
        timestamps: false
    };
    return sequelize.define(table_name, columns, optional);
};