module.exports = function (sequelize, DataTypes) {
  let table_name = 'attendance_regularization';
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
    punch_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    requested_in_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    requested_out_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
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
    tableName: 'attendance_regularization',
    schema: 'public',
    timestamps: false
  };
  return sequelize.define(table_name, columns, optional);
};
