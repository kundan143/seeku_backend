module.exports = function (sequelize,
	DataTypes) {
	return sequelize.define('designation_master', {
		id:
		{
			autoIncrement: true,
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true
		},
		designation:
		{
			type: DataTypes.STRING(255),
			allowNull: false
		},
	}, {
		sequelize,
		tableName: 'designation_master',
		schema: 'public',
		timestamps: false
	});
};