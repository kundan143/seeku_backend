-- Wires salary_increment_history's arrears into payroll: a lump sum lands in whichever
-- payroll run matches the increment's disbursement_month/disbursement_year, added on top of
-- net_salary as its own labeled payslip line (see OP_salaryPayment.js previewBulkPayroll/
-- processBulkPayroll). arrear_paid_status prevents it from being picked up by a second run.
ALTER TABLE salary_increment_history ADD COLUMN IF NOT EXISTS arrear_paid_status SMALLINT NOT NULL DEFAULT 0;
COMMENT ON COLUMN salary_increment_history.arrear_paid_status IS '0 = arrears pending payout, 1 = already folded into a processed payroll run.';

ALTER TABLE salary_payments ADD COLUMN IF NOT EXISTS arrears_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE salary_payments ADD COLUMN IF NOT EXISTS increment_id BIGINT REFERENCES salary_increment_history(id);

COMMENT ON COLUMN salary_payments.arrears_amount IS 'One-time arrears lump sum folded in from salary_increment_history for this run, added on top of gross_salary into net_salary.';
COMMENT ON COLUMN salary_payments.increment_id IS 'salary_increment_history row this arrears payment came from, if any (only set when exactly one contributing increment - see OP_salaryPayment.js).';
