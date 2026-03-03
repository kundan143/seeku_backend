module.exports = function (sequelize, DataTypes) {
let table_name = "emergency_contacts";
let columns = {
    id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users_master",
            key: "id"
        },
    },
    contact_name: {
        type: DataTypes.STRING(255),
        allowNull: false },
    relation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "relation_master",
            key: "id" },
    },
    emergency_mobile: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
};
let optional = {
    sequelize,
    tableName: "emergency_contacts",
    schema: "public",
    timestamps: false,
};
return sequelize.define(table_name, columns, optional);
};
