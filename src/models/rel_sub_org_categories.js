// module.exports = function (sequelize, DataTypes) {
//     let table_name = 'rel_sub_org_categories';
//     let columns = {
//         id: {
//             autoIncrement: true,
//             type: DataTypes.BIGINT,
//             allowNull: false,
//             primaryKey: true
//         },
//         org_id: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//             references: {
//                 model: 'organizations_master',
//                 key: 'id'
//             }
//         },
//         org_sub_cat_id: {
//             type: DataTypes.INTEGER,
//             allowNull: false
//         },
//     };
//     let optional = {
//         sequelize,
//         tableName: 'rel_sub_org_categories',
//         schema: 'public',
//         timestamps: false
//     };
//     return sequelize.define(table_name, columns, optional);
// };