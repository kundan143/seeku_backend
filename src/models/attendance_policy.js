module.exports = function (sequelize, DataTypes) {
  let table_name = 'attendance_policy';
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    policy_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    effective_from: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    office_start_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    office_end_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    total_working_hours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false
    },
    half_day_threshold_hours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false
    },
    min_hours_full_day: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false
    },
    grace_period_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    working_days: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: ['MON', 'TUE', 'WED', 'THU', 'FRI']
    },
    saturday_policy: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'OFF'
    },
    saturday_alternate_weeks: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true
    },
    sunday_policy: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'OFF'
    },
    ot_applicable_after_hours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true
    },
    ot_calculation_basis: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    break_deducted_from_hours: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    break_slots: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    shift_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'DAY'
    },
    attendance_marking_modes: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: ['BIOMETRIC']
    },
    auto_checkout_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    late_coming_grace_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    late_coming_penalty: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    early_leaving_grace_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    early_leaving_penalty: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    location_restriction: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'NONE'
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
    tableName: 'attendance_policy',
    schema: 'public',
    timestamps: false
  };
  return sequelize.define(table_name, columns, optional);
};
