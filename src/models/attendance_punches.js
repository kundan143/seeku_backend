module.exports = function (sequelize, DataTypes) {
  let table_name = 'attendance_punches';
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
    punch_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    punch_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    direction: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    device_emp_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    source: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'IMPORT'
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
    tableName: 'attendance_punches',
    schema: 'public',
    timestamps: false
  };
  return sequelize.define(table_name, columns, optional);
};
