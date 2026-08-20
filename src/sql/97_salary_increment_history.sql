-- Audit trail for increments applied via Employee Salary Master's "Give Increment" action.
-- The live users_salary_details row always holds only the CURRENT salary (no versioning) -
-- this table is the append-only record of what it was before each increment, so history isn't
-- lost when the current row gets overwritten in place.
CREATE TABLE IF NOT EXISTS salary_increment_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users_master(id),
  salary_detail_id BIGINT REFERENCES users_salary_details(id),

  increment_type VARCHAR(20) NOT NULL CHECK (increment_type IN ('percentage', 'flat')),
  increment_value NUMERIC(12, 2) NOT NULL,
  effective_from DATE,

  -- When this increment (and any pay difference it creates) should actually be disbursed -
  -- captured up front here rather than scheduled later.
  disbursement_month SMALLINT CHECK (disbursement_month IS NULL OR disbursement_month BETWEEN 1 AND 12),
  disbursement_year SMALLINT,

  -- Full salary snapshots (all earning/deduction/gross/net fields) before and after this
  -- increment, so the exact change is reconstructable without needing users_salary_details
  -- to still hold either value.
  old_salary_snapshot JSONB NOT NULL,
  new_salary_snapshot JSONB NOT NULL,

  remarks TEXT,
  status SMALLINT NOT NULL DEFAULT 1,

  created_by BIGINT REFERENCES users_master(id),
  created_date TIMESTAMP,
  modified_by BIGINT REFERENCES users_master(id),
  modified_date TIMESTAMP,
  deleted_by BIGINT REFERENCES users_master(id),
  deleted_date TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_salary_increment_history_user ON salary_increment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_salary_increment_history_salary_detail ON salary_increment_history(salary_detail_id);
CREATE INDEX IF NOT EXISTS idx_salary_increment_history_status ON salary_increment_history(status);

COMMENT ON TABLE salary_increment_history IS 'Append-only history of increments applied to users_salary_details via Employee Salary Master''s Give Increment action.';
COMMENT ON COLUMN salary_increment_history.increment_type IS 'percentage: increment_value is a % applied to earnings; flat: increment_value is a flat monthly amount.';
COMMENT ON COLUMN salary_increment_history.disbursement_month IS '1=January..12=December - the month this increment is meant to be paid out/reflected in payroll.';
COMMENT ON COLUMN salary_increment_history.old_salary_snapshot IS 'Full users_salary_details field snapshot immediately before this increment was applied.';
COMMENT ON COLUMN salary_increment_history.new_salary_snapshot IS 'Full users_salary_details field snapshot immediately after this increment was applied (the values saved as the new current salary).';
COMMENT ON COLUMN salary_increment_history.status IS '1 = Active, 0 = Deleted (soft delete).';
