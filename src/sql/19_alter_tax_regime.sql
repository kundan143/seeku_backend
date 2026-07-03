ALTER TABLE users_salary_details ADD COLUMN IF NOT EXISTS tax_regime SMALLINT DEFAULT 2;
COMMENT ON COLUMN users_salary_details.tax_regime IS '1: Old Regime, 2: New Regime';
