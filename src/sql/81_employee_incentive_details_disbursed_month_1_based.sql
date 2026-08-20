-- Corrects disbursed_month_id to the 1-based convention (1=January..12=December) used
-- everywhere else in this codebase (e.g. payment_month, StaticValues.month_list), replacing
-- the 0-based range check from migration 80.
ALTER TABLE employee_incentive_details DROP CONSTRAINT IF EXISTS employee_incentive_details_disbursed_month_id_check;
ALTER TABLE employee_incentive_details ADD CONSTRAINT employee_incentive_details_disbursed_month_id_check
  CHECK (disbursed_month_id IS NULL OR disbursed_month_id BETWEEN 1 AND 12);

COMMENT ON COLUMN employee_incentive_details.disbursed_month_id IS 'Month (1=January..12=December) this incentive was disbursed in, set via the HR Select Month action.';
