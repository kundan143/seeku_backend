module.exports = function (sequelize, DataTypes) {
	return sequelize.define('org_contact_email', {
		id:
		{
			autoIncrement: true,
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true
		},
		cont_id:
		{
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: "org_contact_person",
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
		email:
		{
			type: DataTypes.STRING(255),
			allowNull: false
		},
		purchase:
		{
			type: DataTypes.BOOLEAN,
			allowNull: true,
			defaultValue: false
		},
		sales:
		{
			type: DataTypes.BOOLEAN,
			allowNull: true,
			defaultValue: false
		},
		logistics:
		{
			type: DataTypes.BOOLEAN,
			allowNull: true,
			defaultValue: false
		},
		other:
		{
			type: DataTypes.BOOLEAN,
			allowNull: true,
			defaultValue: false
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
		tableName: 'org_contact_email',
		schema: 'public',
		timestamps: false
	});
};