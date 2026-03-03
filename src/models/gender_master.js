module.exports = function (sequelize, DataTypes) {
let table_name = "gender_master";
let columns = {
    id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
    },
    gender_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
};
let optional = {
    sequelize,
    tableName: "gender_master",
    schema: "public",
    timestamps: false
};
return sequelize.define(table_name, columns, optional);
};
