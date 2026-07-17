module.exports = function (sequelize, DataTypes) {
  let table_name = 'employee_assets';
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    asset_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'asset_master',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users_master',
        key: 'id'
      }
    },
    assigned_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    returned_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    is_deleted: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users_master',
        key: 'id'
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
        model: 'users_master',
        key: 'id'
      }
    },
    modified_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
  };
  let optional = {
    sequelize,
    tableName: 'employee_assets',
    schema: 'public',
    timestamps: false
  };
  return sequelize.define(table_name, columns, optional);
};
