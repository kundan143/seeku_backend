-- Standard vs DA/PF arrear split - previously only the combined total_arrear_amount was persisted;
-- the dialog computes the Standard (Effective From -> before Disbursement) and DA/PF backdate
-- (1st April -> before Effective From) amounts separately live, but never saved them, so there was
-- no way to see afterward how much of an increment's arrear came from which window.
ALTER TABLE salary_increment_history ADD COLUMN IF NOT EXISTS standard_arrear_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE salary_increment_history ADD COLUMN IF NOT EXISTS da_arrear_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;
