module.exports = function (sequelize, DataTypes) {
let table_name = "marital_status_master";
let columns = {
    id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
    },
    status_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
};
let optional = {
    sequelize,
    tableName: "marital_status_master",
    schema: "public",
    timestamps: false
};
return sequelize.define(table_name, columns, optional);
};
