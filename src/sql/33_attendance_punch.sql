ALTER TABLE users_master ADD COLUMN IF NOT EXISTS biometric_emp_code VARCHAR(50) UNIQUE;

COMMENT ON COLUMN users_master.biometric_emp_code IS 'Employee code/PIN enrolled on the biometric attendance device, used to match imported/pushed punch logs to this user';

CREATE TABLE attendance_punches (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users_master(id),
  punch_time TIMESTAMP NOT NULL,
  punch_date DATE NOT NULL,
  direction VARCHAR(10),
  device_emp_code VARCHAR(50),
  source VARCHAR(20) NOT NULL DEFAULT 'IMPORT',
  is_deleted INTEGER DEFAULT 0,
  created_by INTEGER NOT NULL REFERENCES users_master(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_by INTEGER REFERENCES users_master(id),
  modified_date TIMESTAMP
);

COMMENT ON TABLE attendance_punches IS 'Raw biometric attendance punch log - one row per punch event. Imported from device export today; designed so a future live device push can insert into the same table (see source column)';
COMMENT ON COLUMN attendance_punches.user_id IS 'System user this punch belongs to, resolved from device_emp_code via users_master.biometric_emp_code';
COMMENT ON COLUMN attendance_punches.punch_time IS 'Exact timestamp of the punch as recorded by the device';
COMMENT ON COLUMN attendance_punches.punch_date IS 'Calendar date of the punch (derived from punch_time), stored separately for fast per-day grouping/filtering';
COMMENT ON COLUMN attendance_punches.direction IS 'IN/OUT if the device reliably reports it; many device exports do not, so daily summaries are computed by punch_time ordering (earliest = check-in, latest = check-out) instead of relying on this field';
COMMENT ON COLUMN attendance_punches.device_emp_code IS 'Raw employee code from the device export/push, kept for traceability even after resolving to user_id';
COMMENT ON COLUMN attendance_punches.source IS 'Where this punch came from: IMPORT (bulk file upload, current) vs DEVICE_PUSH/MANUAL (future)';
COMMENT ON COLUMN attendance_punches.is_deleted IS 'Soft delete flag (0 = Active, 1 = Deleted)';

CREATE INDEX idx_attendance_punches_user_date ON attendance_punches(user_id, punch_date);
CREATE INDEX idx_attendance_punches_is_deleted ON attendance_punches(is_deleted);

-- Prevent the same exact punch being imported twice
CREATE UNIQUE INDEX uq_attendance_punches_user_time ON attendance_punches(user_id, punch_time);
