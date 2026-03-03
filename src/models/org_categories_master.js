module.exports = function (sequelize, DataTypes) {
	return sequelize.define('org_categories_master', {
		id:
		{
			autoIncrement: true,
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true
		},
		category_type:
		{
			type: DataTypes.STRING(255),
			allowNull: false
		}
	}, {
		sequelize,
		tableName: 'org_categories_master',
		schema: 'public',
		timestamps: false
	});
};