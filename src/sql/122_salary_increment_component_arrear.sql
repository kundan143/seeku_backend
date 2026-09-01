-- Per-component arrear breakdown (Basic/DA/City/HRA/Conveyance/Medical/Travel/Special), stored
-- alongside the existing standard_arrear_amount/da_arrear_amount totals so HR/payroll can see
-- exactly which component contributed how much to the arrear, not just the two-bucket split.
ALTER TABLE salary_increment_history ADD COLUMN IF NOT EXISTS component_arrear_amounts JSONB;
