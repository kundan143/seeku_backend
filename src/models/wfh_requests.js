module.exports = function (sequelize, DataTypes) {
  let table_name = 'wfh_requests';
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users_master', key: 'id' }
    },
    wfh_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    source: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'REQUEST'
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users_master', key: 'id' }
    },
    approved_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejected_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users_master', key: 'id' }
    },
    rejected_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejected_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_deleted: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users_master', key: 'id' }
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    modified_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users_master', key: 'id' }
    },
    modified_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
  };
  let optional = {
    sequelize,
    tableName: 'wfh_requests',
    schema: 'public',
    timestamps: false
  };
  return sequelize.define(table_name, columns, optional);
};
