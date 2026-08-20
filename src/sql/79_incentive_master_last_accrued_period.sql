-- Generalizes last_accrued_year into a (year, period) pair so every frequency - not just
-- yearly - only accrues once per its own period, no matter how many times the accrual job
-- is re-triggered: monthly once per fiscal month (12x/year), quarterly once per fiscal
-- quarter (4x/year), half_yearly once per fiscal half (2x/year), yearly once per fiscal
-- year (1x/year). Period numbering is relative to the fiscal year (Nov-Oct): fiscal month
-- 1 = November ... 12 = October; quarter = ceil(fiscal month / 3); half = ceil(fiscal month / 6).
ALTER TABLE incentive_master ADD COLUMN IF NOT EXISTS last_accrued_period INTEGER;

COMMENT ON COLUMN incentive_master.last_accrued_period IS 'Last fiscal period (month/quarter/half/year index, per frequency) this scheme accrued in, paired with last_accrued_year - prevents double-accrual on re-runs within the same period.';
