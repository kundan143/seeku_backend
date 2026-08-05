-- disbursement_month and is_one_time (added in 67/69) are removed: the accrual cron no
-- longer gates on a specific due month - every active scheme contributes its installment
-- on every run, split by frequency's periods-per-year for flat-type amounts only.
ALTER TABLE incentive_master DROP COLUMN IF EXISTS disbursement_month;
ALTER TABLE incentive_master DROP COLUMN IF EXISTS is_one_time;
