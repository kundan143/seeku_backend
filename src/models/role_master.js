module.exports = function (sequelize, DataTypes) {
	return sequelize.define('role_master', {
		id:
		{
			autoIncrement: true,
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true
		},
		role_name:
		{
			type: DataTypes.STRING(255),
			allowNull: false
		},
	}, {
		sequelize,
		tableName: 'role_master',
		schema: 'public',
		timestamps: false
	});
};