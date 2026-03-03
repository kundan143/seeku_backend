module.exports = function (sequelize, DataTypes) {
let table_name = "emp_type_master";
let columns = {
    id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
    },
    emp_type_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
};
let optional = {
    sequelize,
    tableName: "emp_type_master",
    schema: "public",
    timestamps: false,
};
return sequelize.define(table_name, columns, optional);
};
