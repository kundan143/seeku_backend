-- Work From Home: mirrors attendance_regularization's shape closely, but marks a whole day as
-- WFH (no in/out times) instead of correcting specific punch times. Two entry points share this
-- one table, distinguished by `source`:
--   REQUEST - employee self-submits (starts Pending, needs admin approve/reject)
--   ADMIN   - HR/admin marks directly (auto-approved on insert, no request step)
-- An approved row counts as a full present day in attendance summaries/payroll, same as an
-- approved regularization already does, just without punch times to show.
CREATE TABLE IF NOT EXISTS wfh_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users_master(id),
  wfh_date DATE NOT NULL,
  reason TEXT,
  status INTEGER NOT NULL DEFAULT 0,
  source VARCHAR(20) NOT NULL DEFAULT 'REQUEST',
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

CREATE INDEX IF NOT EXISTS idx_wfh_requests_user_date ON wfh_requests(user_id, wfh_date);
CREATE INDEX IF NOT EXISTS idx_wfh_requests_status ON wfh_requests(status);
CREATE INDEX IF NOT EXISTS idx_wfh_requests_is_deleted ON wfh_requests(is_deleted);

-- One active (pending or approved) WFH record per employee per day - same guard
-- attendance_regularization uses, and the source of the 23505 duplicate check in addData.
CREATE UNIQUE INDEX IF NOT EXISTS uq_wfh_requests_active
  ON wfh_requests(user_id, wfh_date) WHERE status IN (0, 1) AND is_deleted = 0;

COMMENT ON COLUMN wfh_requests.status IS '0 = Pending, 1 = Approved, 2 = Rejected.';
COMMENT ON COLUMN wfh_requests.source IS 'REQUEST = employee self-submitted (starts Pending); ADMIN = HR/admin direct entry (auto-approved).';
