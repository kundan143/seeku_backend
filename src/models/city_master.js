module.exports = function (sequelize, DataTypes) {
	return sequelize.define('city_master', {
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
		state_id:
		{
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "state_master",
				key: "id"
			}
		},
	}, {
		sequelize,
		tableName: 'city_master',
		schema: 'public',
		timestamps: false
	});
};