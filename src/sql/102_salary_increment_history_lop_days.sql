-- Loss-of-Pay days, one field per arrear bucket, prorating that bucket's arrear amount down
-- by (LOP days / (bucket months x 30)) - entered by HR at increment time since past-month
-- attendance isn't otherwise available here.
ALTER TABLE salary_increment_history ADD COLUMN IF NOT EXISTS standard_lop_days INTEGER NOT NULL DEFAULT 0;
ALTER TABLE salary_increment_history ADD COLUMN IF NOT EXISTS da_lop_days INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN salary_increment_history.standard_lop_days IS 'Loss-of-Pay days during the arrear_months window (Effective From up to before Disbursement) - prorates that bucket''s arrear amount down.';
COMMENT ON COLUMN salary_increment_history.da_lop_days IS 'Loss-of-Pay days during the da_arrear_months window (1st April up to before Effective From) - prorates the DA/PF backdate arrear amount down.';
