module.exports = function (sequelize, DataTypes) {
    let table_name = "link_master";
    let columns = {
        id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
    },
    menu_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "menu_master",
            key: "id"
        },
    },
    link_name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    };
  let optional = {
    sequelize,
    tableName: "link_master",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
