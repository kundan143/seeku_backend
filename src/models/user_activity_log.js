module.exports = function (sequelize, DataTypes) {
    let table_name = 'user_activity_log';
    let columns = {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'users_master',
                key: 'id'
            }
        },
        event_type: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        module_name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        route_path: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        page_title: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        method: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        request_body: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        ip_address: {
            type: DataTypes.STRING(64),
            allowNull: true
        },
        user_agent: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        created_date: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
    };
    let optional = {
        sequelize,
        tableName: 'user_activity_log',
        schema: 'public',
        timestamps: false
    };
    return sequelize.define(table_name, columns, optional);
};
