ALTER TABLE users_salary_details RENAME COLUMN lta TO travel_allowance;
ALTER TABLE salary_payments RENAME COLUMN lta TO travel_allowance;

COMMENT ON COLUMN users_salary_details.travel_allowance IS 'Leave Travel Allowance (LTA)';
