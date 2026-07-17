CREATE TABLE attendance_policy (
  id BIGSERIAL PRIMARY KEY,
  policy_name VARCHAR(100) NOT NULL,
  effective_from DATE NOT NULL,

  -- Working hours
  office_start_time TIME NOT NULL,
  office_end_time TIME NOT NULL,
  total_working_hours NUMERIC(4,2) NOT NULL,
  half_day_threshold_hours NUMERIC(4,2) NOT NULL,
  min_hours_full_day NUMERIC(4,2) NOT NULL,
  grace_period_minutes INTEGER NOT NULL DEFAULT 0,

  -- Weekly off / working days
  working_days TEXT[] NOT NULL DEFAULT '{MON,TUE,WED,THU,FRI}',
  saturday_policy VARCHAR(20) NOT NULL DEFAULT 'OFF',
  saturday_alternate_weeks TEXT[],
  sunday_policy VARCHAR(20) NOT NULL DEFAULT 'OFF',

  -- Overtime
  ot_applicable_after_hours NUMERIC(4,2),
  ot_calculation_basis VARCHAR(20),

  -- Break/lunch time
  break_deducted_from_hours BOOLEAN NOT NULL DEFAULT true,
  break_slots JSONB NOT NULL DEFAULT '[]',

  -- Shift & marking
  shift_type VARCHAR(20) NOT NULL DEFAULT 'DAY',
  attendance_marking_modes TEXT[] NOT NULL DEFAULT '{BIOMETRIC}',
  auto_checkout_enabled BOOLEAN NOT NULL DEFAULT false,

  -- Late / early rules
  late_coming_grace_count INTEGER,
  late_coming_penalty VARCHAR(100),
  early_leaving_grace_count INTEGER,
  early_leaving_penalty VARCHAR(100),

  -- Location
  location_restriction VARCHAR(20) NOT NULL DEFAULT 'NONE',

  is_deleted INTEGER DEFAULT 0,
  created_by INTEGER NOT NULL REFERENCES users_master(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_by INTEGER REFERENCES users_master(id),
  modified_date TIMESTAMP
);

COMMENT ON TABLE attendance_policy IS 'Versioned attendance configuration - a new row is added (never edited in place) whenever a setting changes, effective from a given date, so past attendance history is never reinterpreted by a later config change';
COMMENT ON COLUMN attendance_policy.effective_from IS 'Date this policy version takes effect; the applicable policy for a given day is the row with the latest effective_from <= that day';
COMMENT ON COLUMN attendance_policy.half_day_threshold_hours IS 'Worked hours below this = Absent';
COMMENT ON COLUMN attendance_policy.min_hours_full_day IS 'Worked hours at/above this = Present (full day); between half_day_threshold_hours and this = Half Day';
COMMENT ON COLUMN attendance_policy.grace_period_minutes IS 'Buffer after office_start_time before a punch is considered late';
COMMENT ON COLUMN attendance_policy.working_days IS 'Which days of the week are working days, e.g. {MON,TUE,WED,THU,FRI,SAT}';
COMMENT ON COLUMN attendance_policy.saturday_policy IS 'OFF, HALF_DAY, FULL_DAY, or ALTERNATE (uses saturday_alternate_weeks to say which Saturdays are off)';
COMMENT ON COLUMN attendance_policy.saturday_alternate_weeks IS 'Which Saturdays of the month are OFF when saturday_policy = ALTERNATE, e.g. {1,3} for 1st & 3rd Saturday off';
COMMENT ON COLUMN attendance_policy.sunday_policy IS 'OFF, HALF_DAY, or FULL_DAY';
COMMENT ON COLUMN attendance_policy.ot_applicable_after_hours IS 'Hours worked beyond which overtime applies';
COMMENT ON COLUMN attendance_policy.ot_calculation_basis IS 'HOURLY_RATE, FIXED, or COMP_OFF';
COMMENT ON COLUMN attendance_policy.break_deducted_from_hours IS 'Whether break time is subtracted from worked hours before applying the present/half-day/absent thresholds';
COMMENT ON COLUMN attendance_policy.break_slots IS 'Array of {name, start_time, end_time}, e.g. [{"name":"Lunch","start_time":"13:00","end_time":"13:30"}]';
COMMENT ON COLUMN attendance_policy.shift_type IS 'DAY, NIGHT, or ROTATIONAL - a single company-wide default; per-employee/department shift assignment is not implemented yet';
COMMENT ON COLUMN attendance_policy.attendance_marking_modes IS 'Which punch sources are accepted, e.g. {BIOMETRIC,WEB_CHECKIN,MOBILE_GPS,MANUAL}';
COMMENT ON COLUMN attendance_policy.auto_checkout_enabled IS 'Config flag only - actually auto-marking checkout at shift end requires a scheduled job, not yet implemented';
COMMENT ON COLUMN attendance_policy.late_coming_penalty IS 'Free-text description of the penalty rule, e.g. "3 late-comings = 1 half day deduction" - enforcement logic not yet implemented';
COMMENT ON COLUMN attendance_policy.early_leaving_penalty IS 'Free-text description of the penalty rule - enforcement logic not yet implemented';
COMMENT ON COLUMN attendance_policy.location_restriction IS 'NONE, OFFICE_ONLY, WFH_ALLOWED, or GEOFENCE - config flag only, actual geofencing/IP enforcement not yet implemented';

CREATE INDEX idx_attendance_policy_effective_from ON attendance_policy(effective_from);
CREATE INDEX idx_attendance_policy_is_deleted ON attendance_policy(is_deleted);
