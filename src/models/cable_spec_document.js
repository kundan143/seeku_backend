module.exports = function (sequelize, DataTypes) {
    let table_name = 'cable_spec_document';
    let columns = {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true
        },
        file_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        file_url: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        cable_standard: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 1
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users_master', key: 'id' }
        },
        created_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        modified_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'users_master', key: 'id' }
        },
        modified_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'users_master', key: 'id' }
        },
        deleted_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        extracted_design: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        extracted_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
    };
    let optional = {
        sequelize,
        tableName: 'cable_spec_document',
        schema: 'public',
        timestamps: false
    };
    return sequelize.define(table_name, columns, optional);
};
