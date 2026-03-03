module.exports = function (sequelize, DataTypes) {
	return sequelize.define('rel_org_categories', {
		id:
		{
			autoIncrement: true,
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true
		},
		org_id:
		{
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "organization_master",
				key: "id"
			}
		},
		org_cat_id:
		{
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "org_categories_master",
				key: "id"
			}
		},
		maximum_quantity: {
			type: DataTypes.DOUBLE,
			allowNull: false,
			defaultValue: 0
		},
	}, {
		sequelize,
		tableName: 'rel_org_categories',
		schema: 'public',
		timestamps: false
	});
};