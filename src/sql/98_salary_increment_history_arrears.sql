-- Arrears owed for the months between effective_from and disbursement_month/year, paid as a
-- one-time lump sum alongside the disbursement. Captured on the history row only - not wired
-- into salary_payments/payroll processing in this iteration.
ALTER TABLE salary_increment_history ADD COLUMN IF NOT EXISTS arrear_months INTEGER NOT NULL DEFAULT 0;
ALTER TABLE salary_increment_history ADD COLUMN IF NOT EXISTS total_arrear_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;

COMMENT ON COLUMN salary_increment_history.arrear_months IS 'Whole months between effective_from and disbursement_month/disbursement_year that were already paid at the old rate.';
COMMENT ON COLUMN salary_increment_history.total_arrear_amount IS 'arrear_months x (new gross - old gross) - one-time lump sum owed alongside the disbursement.';
