module.exports = function (sequelize, DataTypes) {
	return sequelize.define('org_bank_master', {
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
		bank_name:
		{
			type: DataTypes.STRING(255),
			allowNull: false
		},
		bank_address:
		{
			type: DataTypes.TEXT,
			allowNull: false
		},
		branch_name:
		{
			type: DataTypes.STRING(255),
			allowNull: false
		},
		account_name:
		{
			type: DataTypes.STRING(255),
			allowNull: true
		},
		account_no:
		{
			type: DataTypes.STRING(255),
			allowNull: true
		},
		swift_code:
		{
			type: DataTypes.STRING(255),
			allowNull: false
		},
		ifsc_code:
		{
			type: DataTypes.STRING(255),
			allowNull: true
		},
		iban_no:
		{
			type: DataTypes.STRING(255),
			allowNull: true
		},
		bank_type:
		{
			type: DataTypes.INTEGER,
			allowNull: true
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
		contact_person:
		{
			type: DataTypes.STRING(255),
			allowNull: true
		},
		phone_no:
		{
			type: DataTypes.STRING(255),
			allowNull: true
		},
		modified_date:
		{
			type: DataTypes.DATE,
			allowNull: true
		},
	}, {
		sequelize,
		tableName: 'org_bank_master',
		schema: 'public',
		timestamps: false
	});
};