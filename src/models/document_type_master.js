module.exports = function (sequelize, DataTypes) {
	return sequelize.define('document_type_master', {
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
		department_id: {
			type: DataTypes.BIGINT,
			allowNull: true,
			references: {
				model: "department_master",
				key: "id"
			}
		},
		status: {
			type: DataTypes.SMALLINT,
			allowNull: true,
			defaultValue: 1
		},
		created_by: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "users_master",
				key: "id"
			}
		},
		created_date: {
			type: DataTypes.DATE,
			allowNull: true
		},
		modified_by: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: "users_master",
				key: "id"
			}
		},
		modified_date: {
			type: DataTypes.DATE,
			allowNull: true
		},
		deleted_by: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: "users_master",
				key: "id"
			}
		},
		deleted_date: {
			type: DataTypes.DATE,
			allowNull: true
		},
	}, {
		sequelize,
		tableName: 'document_type_master',
		schema: 'public',
		timestamps: false
	});
};
