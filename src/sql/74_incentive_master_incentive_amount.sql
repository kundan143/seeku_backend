-- Stores the computed payout amount at save time: for value_type = 'percentage' this is
-- round((employee's basic + DA) * incentive_value / 100, 2); for 'flat' it's incentive_value
-- as-is. Kept as a snapshot column (computed in OP_IncentiveMaster.js on add/update) rather
-- than a generated column since percentage amounts depend on the employee's current salary,
-- which is looked up at save time, not re-evaluated on every read.
ALTER TABLE incentive_master ADD COLUMN IF NOT EXISTS incentive_amount NUMERIC(12, 2);

COMMENT ON COLUMN incentive_master.incentive_amount IS 'Snapshot amount computed on save: (basic + DA) * incentive_value / 100 for percentage type, or incentive_value itself for flat type';
