module.exports = function (sequelize,DataTypes) {
	return sequelize.define('organizations_master',
		{
			id:
			{
				autoIncrement: true,
				type: DataTypes.BIGINT,
				allowNull: false,
				primaryKey: true
			},
			org_name:
			{
				type: DataTypes.STRING(255),
				allowNull: false
			},
			ie_code:
			{
				type: DataTypes.STRING(255),
				allowNull: true
			},
			gst_no:
			{
				type: DataTypes.STRING(255),
				allowNull: true
			},
			pan_no:
			{
				type: DataTypes.STRING(255),
				allowNull: true
			},
			registration_no:
			{
				type: DataTypes.STRING(255),
				allowNull: true
			},
			description:
			{
				type: DataTypes.STRING(255),
				allowNull: true
			},
			sales_zone_id:
			{
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: "users_master",
					key: "id"
				}
			},
			created_date:
			{
				type: DataTypes.DATE,
				allowNull: true
			},
			created_by:
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
			modified_by:
			{
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: "users_master",
					key: "id"
				}
			},
			status:
			{
				type: DataTypes.BOOLEAN,
				allowNull: true,
				defaultValue: true
			},
			irc_code:
			{
				type: DataTypes.STRING(255),
				allowNull: true
			},
			bin_no:
			{
				type: DataTypes.STRING(255),
				allowNull: true
			},
			tin:
			{
				type: DataTypes.STRING(255),
				allowNull: true
			},
			is_generate_so:
			{
				type: DataTypes.INTEGER,
				allowNull: true,
				defaultValue: 0
			}
		},
		{
			sequelize,
			tableName: 'organizations_master',
			schema: 'public',
			timestamps: false
		});
};