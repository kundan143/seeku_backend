module.exports = function (sequelize, DataTypes) {
let table_name = "blood_group_master";
let columns = {
    id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
    },
    blood_group_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
};
let optional = {
    sequelize,
    tableName: "blood_group_master",
    schema: "public",
    timestamps: false
};
return sequelize.define(table_name, columns, optional);
};
