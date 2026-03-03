module.exports = function (sequelize, DataTypes) {
	return sequelize.define('country_master', {
		id: {
			autoIncrement: true,
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		iso_code: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		phone_code: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 1
		},
		country_shipping_instructions: {
			type: DataTypes.TEXT,
			allowNull: true
		}
	}, {
		sequelize,
		tableName: 'country_master',
		schema: 'public',
		timestamps: false
	});
};