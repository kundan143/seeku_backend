-- Lets a processed payroll run carry a one-time arrears lump sum (from salary_increment_master)
-- as its own labeled payslip line, on top of the regular prorated earnings.
ALTER TABLE salary_payments ADD COLUMN IF NOT EXISTS arrears_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE salary_payments ADD COLUMN IF NOT EXISTS increment_id BIGINT REFERENCES salary_increment_master(id);

COMMENT ON COLUMN salary_payments.arrears_amount IS 'One-time arrears lump sum folded in from salary_increment_master for this run, added on top of gross_salary into net_salary.';
COMMENT ON COLUMN salary_payments.increment_id IS 'salary_increment_master row this arrears payment came from, if any.';
