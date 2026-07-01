module.exports = function (sequelize, DataTypes) {
    let table_name = 'user_document_master';
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
            references: { model: 'users_master', key: 'id' }
        },
        doc_type: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        doc_no: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        doc_url: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        status: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 1
        },
        created_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: { model: 'users_master', key: 'id' }
        },
        created_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        modified_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: { model: 'users_master', key: 'id' }
        },
        modified_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        deleted_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: { model: 'users_master', key: 'id' }
        },
        deleted_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
    };
    let optional = {
        sequelize,
        tableName: 'user_document_master',
        schema: 'public',
        timestamps: false
    };
    return sequelize.define(table_name, columns, optional);
};
