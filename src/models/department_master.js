module.exports = function (sequelize, DataTypes) {
	return sequelize.define('department_master', {
		id: {
			autoIncrement: true,
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
	}, {
		sequelize,
		tableName: 'department_master',
		schema: 'public',
		timestamps: false
	});
};