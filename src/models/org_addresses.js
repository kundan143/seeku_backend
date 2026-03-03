module.exports = function (sequelize, DataTypes) {
	return sequelize.define('org_addresses', {
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
			allowNull: true,
			references: {
				model: "organization_master",
				key: "id"
			}
		},
		address:
		{
			type: DataTypes.TEXT,
			allowNull: true
		},
		city_id:
		{
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: "city_master",
				key: "id"
			}
		},
		state_id:
		{
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: "state_master",
				key: "id"
			}
		},
		country_id:
		{
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "country_master",
				key: "id"
			}
		},
		postal_code:
		{
			type: DataTypes.STRING(255),
			allowNull: false
		},
		landmark:
		{
			type: DataTypes.STRING(255),
			allowNull: true
		},
		address_type:
		{
			type: DataTypes.STRING(255),
			allowNull: false
		},
		complete_address: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		state_gst_no: {
			type: DataTypes.STRING(200),
			allowNull: true
		},
		address_status: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 1
		},
		created_by:
		{
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "users_master",
				key: "id"
			}
		},
		created_date:
		{
			type: DataTypes.DATE,
			allowNull: false
		},
		modified_by:
		{
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: "users_master",
				key: "id"
			}
		},
		modified_date:
		{
			type: DataTypes.DATE,
			allowNull: true
		},
	}, {
		sequelize,
		tableName: 'org_addresses',
		schema: 'public',
		timestamps: false
	});
};