-- Audit trail + once-per-month lock for HR's "Add N days for all employees" bulk leave credit
-- button on Employee Leave Balance. The UNIQUE constraint is the real guard against double-crediting
-- in the same month (not just a UI check) - a second attempt fails at INSERT time even under a race
-- between two HR users, or if the client's notion of "already used this month" is stale.
CREATE TABLE IF NOT EXISTS leave_bulk_credit_log (
  id BIGSERIAL PRIMARY KEY,
  leave_type_id INTEGER NOT NULL REFERENCES leave_type_master(id),
  credit_days NUMERIC(5,1) NOT NULL,
  credited_month SMALLINT NOT NULL,
  credited_year SMALLINT NOT NULL,
  employees_count INTEGER NOT NULL DEFAULT 0,
  created_by BIGINT REFERENCES users_master(id),
  created_date TIMESTAMP,
  UNIQUE (leave_type_id, credited_month, credited_year)
);
