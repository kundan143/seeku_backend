-- Variable Pay payroll automation: a Yearly Variable Pay pays out in full, once, in its
-- configured Disbursement Month; a Half-Yearly one pays out twice, in that month and again 6
-- months later (derived, not stored separately). Monthly ones keep prorating into every month's
-- gross as before - this column only matters for Yearly/Half-Yearly.
ALTER TABLE users_salary_details
  ADD COLUMN IF NOT EXISTS variable_pay_1_disbursement_month SMALLINT,
  ADD COLUMN IF NOT EXISTS variable_pay_2_disbursement_month SMALLINT,
  ADD COLUMN IF NOT EXISTS variable_pay_3_disbursement_month SMALLINT,
  ADD COLUMN IF NOT EXISTS variable_pay_4_disbursement_month SMALLINT;

COMMENT ON COLUMN users_salary_details.variable_pay_1_disbursement_month IS '1-12 (Jan-Dec); only meaningful when frequency is Yearly or Half-Yearly';
COMMENT ON COLUMN users_salary_details.variable_pay_2_disbursement_month IS '1-12 (Jan-Dec); only meaningful when frequency is Yearly or Half-Yearly';
COMMENT ON COLUMN users_salary_details.variable_pay_3_disbursement_month IS '1-12 (Jan-Dec); only meaningful when frequency is Yearly or Half-Yearly';
COMMENT ON COLUMN users_salary_details.variable_pay_4_disbursement_month IS '1-12 (Jan-Dec); only meaningful when frequency is Yearly or Half-Yearly';

-- salary_payments is a per-pay-run snapshot (like exgratia/bonus already there) - records the
-- actual lump-sum amount paid out this month for each Variable Pay, which is usually 0 except in
-- a Yearly/Half-Yearly item's disbursement month(s).
ALTER TABLE salary_payments
  ADD COLUMN IF NOT EXISTS variable_pay_1 DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS variable_pay_2 DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS variable_pay_3 DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS variable_pay_4 DECIMAL(12,2) DEFAULT 0.00;
