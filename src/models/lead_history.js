module.exports = function (sequelize, DataTypes) {
    let table_name = 'lead_history';
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
        field_name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        old_value: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        new_value: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        change_type: {
            type: DataTypes.STRING(20),
            allowNull: false
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
    };
    let optional = {
        sequelize,
        tableName: 'lead_history',
        schema: 'public',
        timestamps: false
    };
    return sequelize.define(table_name, columns, optional);
};
