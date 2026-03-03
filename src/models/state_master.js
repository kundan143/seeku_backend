module.exports = function (sequelize, DataTypes) {
	return sequelize.define('state_master', {
		id:
		{
			autoIncrement: true,
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true
		},
		name:
		{
			type: DataTypes.STRING(255),
			allowNull: false
		},
		country_id:
		{
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "country_master",
				key: "id"
			}
		}
	}, {
		sequelize,
		tableName: 'state_master',
		schema: 'public',
		timestamps: false
	});
};