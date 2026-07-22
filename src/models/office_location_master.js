module.exports = function (sequelize, DataTypes) {
	return sequelize.define('office_location_master', {
		id: {
			autoIncrement: true,
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true
		},
		location_code: {
			type: DataTypes.STRING(50),
			allowNull: false,
			unique: true
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		full_address: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		city_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: "city_master",
				key: "id"
			}
		},
		state_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: "state_master",
				key: "id"
			}
		},
		pincode: {
			type: DataTypes.STRING(20),
			allowNull: true
		},
		status: {
			type: DataTypes.INTEGER,
			allowNull: false,
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
		tableName: 'office_location_master',
		schema: 'public',
		timestamps: false
	});
};
