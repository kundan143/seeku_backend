module.exports = function (sequelize, DataTypes) {
	return sequelize.define('menu_master', {
		id:
		{
			autoIncrement: true,
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true
		},
		parent_id:
		{
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: "menu_master",
				key: "id"
			}
		},
		menu_name:
		{
			type: DataTypes.STRING(255),
			allowNull: false
		},
		link:
		{
			type: DataTypes.STRING(255),
			allowNull: false
		},
		icon:
		{
			type: DataTypes.TEXT,
			allowNull: false
		},
		parent_rank:
		{
			type: DataTypes.INTEGER,
			allowNull: true,
			default: 0
		},
		child_rank:
		{
			type: DataTypes.INTEGER,
			allowNull: true,
			default: 0
		},
		lock_email:
		{
			type: DataTypes.STRING(255),
			allowNull: true
		},
		lock_password_hash:
		{
			type: DataTypes.TEXT,
			allowNull: true
		},
		lock_failed_attempts:
		{
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		lock_locked_until:
		{
			type: DataTypes.DATE,
			allowNull: true
		}
	}, {
		sequelize,
		tableName: 'menu_master',
		schema: 'public',
		timestamps: false
	});
};