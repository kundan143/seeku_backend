module.exports = function (sequelize, DataTypes) {
    let table_name = "system_config";
    let columns = {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
        },
        config_key: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        config_value: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    };
    let optional = {
        sequelize,
        tableName: "system_config",
        schema: "public",
        timestamps: false,
    };
    return sequelize.define(table_name, columns, optional);
};
