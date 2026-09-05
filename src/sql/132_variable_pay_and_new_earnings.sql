-- New Salary Master / Increment / Offer Letter earning components:
-- - Variable Pay 1-4: each an amount plus an informational Monthly/Half-Yearly/Yearly
--   frequency tag. CTC-structure metadata only (per business decision) - no payroll automation
--   splits a Yearly/Half-Yearly amount into specific disbursement months; the amount is treated
--   as a monthly figure and included in gross salary like any other earning.
-- - Fuel/Transport Expenses, Medical Insurance, Accidental Insurance, Uniform: flat monthly
--   earning components, included in gross salary same as Special Allowance.
-- Added to both users_salary_details (employee) and candidates (offer letter) so an accepted
-- offer's structure carries over unchanged at hire time (see OP_Candidates.js convertToEmployee).
ALTER TABLE users_salary_details
  ADD COLUMN IF NOT EXISTS variable_pay_1 DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS variable_pay_1_frequency VARCHAR(20) DEFAULT 'Monthly',
  ADD COLUMN IF NOT EXISTS variable_pay_2 DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS variable_pay_2_frequency VARCHAR(20) DEFAULT 'Monthly',
  ADD COLUMN IF NOT EXISTS variable_pay_3 DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS variable_pay_3_frequency VARCHAR(20) DEFAULT 'Monthly',
  ADD COLUMN IF NOT EXISTS variable_pay_4 DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS variable_pay_4_frequency VARCHAR(20) DEFAULT 'Monthly',
  ADD COLUMN IF NOT EXISTS fuel_transport_expenses DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS medical_insurance DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS accidental_insurance DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS uniform DECIMAL(12,2) DEFAULT 0.00;

COMMENT ON COLUMN users_salary_details.variable_pay_1 IS 'Variable Pay component 1 (monthly amount)';
COMMENT ON COLUMN users_salary_details.variable_pay_1_frequency IS 'Informational only: Monthly / Half-Yearly / Yearly';
COMMENT ON COLUMN users_salary_details.variable_pay_2 IS 'Variable Pay component 2 (monthly amount)';
COMMENT ON COLUMN users_salary_details.variable_pay_2_frequency IS 'Informational only: Monthly / Half-Yearly / Yearly';
COMMENT ON COLUMN users_salary_details.variable_pay_3 IS 'Variable Pay component 3 (monthly amount)';
COMMENT ON COLUMN users_salary_details.variable_pay_3_frequency IS 'Informational only: Monthly / Half-Yearly / Yearly';
COMMENT ON COLUMN users_salary_details.variable_pay_4 IS 'Variable Pay component 4 (monthly amount)';
COMMENT ON COLUMN users_salary_details.variable_pay_4_frequency IS 'Informational only: Monthly / Half-Yearly / Yearly';

ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS variable_pay_1 DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS variable_pay_1_frequency VARCHAR(20) DEFAULT 'Monthly',
  ADD COLUMN IF NOT EXISTS variable_pay_2 DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS variable_pay_2_frequency VARCHAR(20) DEFAULT 'Monthly',
  ADD COLUMN IF NOT EXISTS variable_pay_3 DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS variable_pay_3_frequency VARCHAR(20) DEFAULT 'Monthly',
  ADD COLUMN IF NOT EXISTS variable_pay_4 DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS variable_pay_4_frequency VARCHAR(20) DEFAULT 'Monthly',
  ADD COLUMN IF NOT EXISTS fuel_transport_expenses DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS medical_insurance DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS accidental_insurance DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS uniform DECIMAL(12,2) DEFAULT 0.00;
