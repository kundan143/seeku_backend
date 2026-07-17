CREATE TABLE attendance_regularization (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users_master(id),
  punch_date DATE NOT NULL,
  requested_in_time TIME,
  requested_out_time TIME,
  reason TEXT NOT NULL,
  status INTEGER NOT NULL DEFAULT 0,
  approved_by INTEGER REFERENCES users_master(id),
  approved_date TIMESTAMP,
  rejected_by INTEGER REFERENCES users_master(id),
  rejected_date TIMESTAMP,
  rejected_reason TEXT,
  is_deleted INTEGER DEFAULT 0,
  created_by INTEGER NOT NULL REFERENCES users_master(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_by INTEGER REFERENCES users_master(id),
  modified_date TIMESTAMP
);

COMMENT ON TABLE attendance_regularization IS 'Employee requests to correct/backfill attendance for a day (missed punch, device issue, etc.) - once approved, the day counts as present using the requested times';
COMMENT ON COLUMN attendance_regularization.punch_date IS 'The attendance date being regularized';
COMMENT ON COLUMN attendance_regularization.requested_in_time IS 'Employee-requested check-in time for this date';
COMMENT ON COLUMN attendance_regularization.requested_out_time IS 'Employee-requested check-out time for this date';
COMMENT ON COLUMN attendance_regularization.reason IS 'Employee explanation for why regularization is needed';
COMMENT ON COLUMN attendance_regularization.status IS 'Request status (0 = Pending, 1 = Approved, 2 = Rejected)';
COMMENT ON COLUMN attendance_regularization.approved_by IS 'User who approved the request (references users_master.id)';
COMMENT ON COLUMN attendance_regularization.rejected_by IS 'User who rejected the request (references users_master.id)';
COMMENT ON COLUMN attendance_regularization.rejected_reason IS 'Reason given for rejecting the request';
COMMENT ON COLUMN attendance_regularization.is_deleted IS 'Soft delete flag (0 = Active, 1 = Deleted) - e.g. employee withdrawing a pending request';

CREATE INDEX idx_attendance_regularization_user_date ON attendance_regularization(user_id, punch_date);
CREATE INDEX idx_attendance_regularization_status ON attendance_regularization(status);
CREATE INDEX idx_attendance_regularization_is_deleted ON attendance_regularization(is_deleted);

-- Only one active (pending or approved) regularization request per employee per day
CREATE UNIQUE INDEX uq_attendance_regularization_active ON attendance_regularization(user_id, punch_date) WHERE status IN (0, 1) AND is_deleted = 0;
