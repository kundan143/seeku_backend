-- employee_incentive_details rows are no longer tied to a specific incentive_master
-- scheme; each employee has at most one accrued row per (year, period_month).
ALTER TABLE employee_incentive_details DROP COLUMN IF EXISTS incentive_id CASCADE;
ALTER TABLE employee_incentive_details DROP COLUMN IF EXISTS value_type;
ALTER TABLE employee_incentive_details DROP COLUMN IF EXISTS basic_da;

ALTER TABLE employee_incentive_details
  ADD CONSTRAINT employee_incentive_details_employee_year_month_key UNIQUE (employee_id, year, period_month);
