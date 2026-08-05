-- effective_from/effective_to (added in 64) are removed: the accrual cron no longer gates
-- eligibility on a date window - every scheme with status = 1 contributes on every run.
ALTER TABLE incentive_master DROP COLUMN IF EXISTS effective_from;
ALTER TABLE incentive_master DROP COLUMN IF EXISTS effective_to;
