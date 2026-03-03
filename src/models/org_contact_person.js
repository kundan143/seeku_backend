module.exports = function (sequelize, DataTypes) {
	return sequelize.define('org_contact_person', {
		id:
		{
			autoIncrement: true,
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true
		},
		person_name:
		{
			type: DataTypes.STRING(255),
			allowNull: false
		},
		designation_id:
		{
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: "designation_master",
				key: "id"
			}
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
		org_address_id:
		{
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: "org_addresses",
				key: "id"
			}
		},
		is_copied:
		{
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 0
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
		tableName: 'org_contact_person',
		schema: 'public',
		timestamps: false
	});
};