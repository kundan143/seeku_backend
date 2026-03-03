// module.exports = function (sequelize, DataTypes) {
// 	return sequelize.define('rel_org_users', {
// 		id:
// 		{
// 			autoIncrement: true,
// 			type: DataTypes.BIGINT,
// 			allowNull: false,
// 			primaryKey: true
// 		},
// 		user_id:
// 		{
// 			type: DataTypes.INTEGER,
// 			allowNull: true,
// 			references: {
// 				model: "users_master",
// 				key: "id"
// 			}
// 		},
// 		org_id:
// 		{
// 			type: DataTypes.INTEGER,
// 			allowNull: true,
// 			references: {
// 				model: "organization_master",
// 				key: "id"
// 			}
// 		},
// 	}, {
// 		sequelize,
// 		tableName: 'rel_org_users',
// 		schema: 'public',
// 		timestamps: false
// 	});
// };