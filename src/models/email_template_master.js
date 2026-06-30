module.exports = function (sequelize, DataTypes) {
	return sequelize.define('email_template_master', {
		id: {
			autoIncrement: true,
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true
		},
		template_name: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		department_id: {
			type: DataTypes.BIGINT,
			allowNull: true
		},
		subject: {
			type: DataTypes.STRING(500),
			allowNull: false
		},
		body: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		is_active: {
			type: DataTypes.SMALLINT,
			allowNull: true,
			defaultValue: 1
		},
		created_by: {
			type: DataTypes.BIGINT,
			allowNull: true
		},
		created_date: {
			type: DataTypes.DATE,
			allowNull: true
		},
		modified_by: {
			type: DataTypes.BIGINT,
			allowNull: true
		},
		modified_date: {
			type: DataTypes.DATE,
			allowNull: true
		},
		deleted_by: {
			type: DataTypes.BIGINT,
			allowNull: true
		},
	}, {
		sequelize,
		tableName: 'email_template_master',
		schema: 'public',
		timestamps: false
	});
};
