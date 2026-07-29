module.exports = function (sequelize, DataTypes) {
	return sequelize.define('pdf_template_master', {
		id: {
			autoIncrement: true,
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true
		},
		template_name: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		template_type: {
			type: DataTypes.STRING(50),
			allowNull: false
		},
		html_content: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		block_schema: {
			type: DataTypes.JSONB,
			allowNull: true
		},
		is_default: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		is_active: {
			type: DataTypes.SMALLINT,
			allowNull: false,
			defaultValue: 1
		},
		created_by: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		created_date: {
			type: DataTypes.DATE,
			allowNull: true
		},
		modified_by: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		modified_date: {
			type: DataTypes.DATE,
			allowNull: true
		},
		deleted_by: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
	}, {
		sequelize,
		tableName: 'pdf_template_master',
		schema: 'public',
		timestamps: false
	});
};
