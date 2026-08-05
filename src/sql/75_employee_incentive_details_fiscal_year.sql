-- employee_incentive_details moves from one row per (employee, year, calendar month) to one
-- row per (employee, fiscal year): the accrual cron now sums each period's installment
-- directly into a single running total for the fiscal year instead of writing a new row per
-- calendar month. Fiscal year runs November-October and is labeled by its starting year
-- (e.g. Nov 2025-Oct 2026 is stored as year = 2025).
ALTER TABLE employee_incentive_details DROP CONSTRAINT IF EXISTS employee_incentive_details_employee_year_month_key;
ALTER TABLE employee_incentive_details DROP COLUMN IF EXISTS period_month;
ALTER TABLE employee_incentive_details ADD CONSTRAINT employee_incentive_details_employee_year_key UNIQUE (employee_id, year);

COMMENT ON COLUMN employee_incentive_details.year IS 'Fiscal year (Nov-Oct), labeled by its starting year - e.g. Nov 2025-Oct 2026 = 2025.';
