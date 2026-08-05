-- Records which month an accrued incentive was actually disbursed/paid out in, set from the
-- HR "Select Month" action on the Employee Incentive Details screen. 0-based (0=January .. 11=December)
-- to match the frontend's StaticValues.month_list convention.
ALTER TABLE employee_incentive_details ADD COLUMN IF NOT EXISTS disbursed_month_id INTEGER
  CHECK (disbursed_month_id IS NULL OR disbursed_month_id BETWEEN 0 AND 11);

COMMENT ON COLUMN employee_incentive_details.disbursed_month_id IS 'Month (0=January..11=December) this incentive was disbursed in, set via the HR Select Month action.';
