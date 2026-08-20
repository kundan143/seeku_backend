-- Tracks the fiscal year a yearly-frequency scheme last contributed to accrual, so the
-- accrual cron can skip it on subsequent runs within the same fiscal year (yearly schemes
-- should only ever add once per fiscal year, even if the job is re-triggered multiple
-- times). Monthly/quarterly/half_yearly schemes are unaffected - they contribute on every run.
ALTER TABLE incentive_master ADD COLUMN IF NOT EXISTS last_accrued_year INTEGER;

COMMENT ON COLUMN incentive_master.last_accrued_year IS 'Fiscal year (Nov-Oct, starting-year label) this yearly-frequency scheme last accrued in - used to prevent double-accrual on re-runs within the same fiscal year.';
