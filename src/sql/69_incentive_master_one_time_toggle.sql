-- Revert 68: "one-time" is not a Frequency value - Frequency stays Monthly/Quarterly/
-- Half-Yearly/Yearly. Instead, add a separate toggle that only applies when frequency =
-- 'monthly': normally monthly recurs every month, but is_one_time lets it be a single
-- non-recurring payout in one specific month (disbursement_month) instead.
ALTER TABLE incentive_master DROP CONSTRAINT IF EXISTS incentive_master_frequency_check;
ALTER TABLE incentive_master ADD CONSTRAINT incentive_master_frequency_check
  CHECK (frequency IN ('monthly', 'quarterly', 'half_yearly', 'yearly'));

ALTER TABLE incentive_master ADD COLUMN IF NOT EXISTS is_one_time BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN incentive_master.is_one_time IS 'Only meaningful when frequency = monthly: true = single non-recurring payout in disbursement_month instead of every month';
