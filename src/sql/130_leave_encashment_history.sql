-- Leave encashment - HR converts an employee's leave balance above the 15-day threshold to a
-- cash payout. Direct action (no separate approval step), same simplicity level as the existing
-- "Add N Days for All Employees" bulk credit on this same screen. Records the actual figures
-- used (remaining balance before, days encashed, per-day rate) so the history stays accurate
-- even if salary/balance data changes later.
CREATE TABLE IF NOT EXISTS leave_encashment_history (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users_master(id),
  leave_type_id INTEGER NOT NULL REFERENCES leave_type_master(id),
  leave_balance_id BIGINT REFERENCES user_leave_balance(id),
  remaining_days_before NUMERIC(5,2) NOT NULL,
  encashed_days NUMERIC(5,2) NOT NULL,
  per_day_amount NUMERIC(12,2) NOT NULL,
  encashment_amount NUMERIC(12,2) NOT NULL,
  remarks TEXT,
  created_by BIGINT REFERENCES users_master(id),
  created_date TIMESTAMP
);
