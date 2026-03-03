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
		}
	}, {
		sequelize,
		tableName: 'menu_master',
		schema: 'public',
		timestamps: false
	});
};