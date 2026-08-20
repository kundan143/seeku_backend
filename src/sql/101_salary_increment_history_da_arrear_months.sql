-- Dearness Allowance and PF (Employee) are backdated to April 1st of the financial year the
-- disbursement falls in (FY runs April-March), independently of arrear_months (which anchors
-- Basic/HRA/City Allowance/etc to this increment's own effective_from instead). Tracked
-- separately here for audit even though total_arrear_amount already nets everything together.
ALTER TABLE salary_increment_history ADD COLUMN IF NOT EXISTS da_arrear_months INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN salary_increment_history.da_arrear_months IS 'Whole months from April 1st of the relevant financial year up to (excluding) disbursement_month - the retroactive period used for Dearness Allowance and PF (Employee) arrears specifically, independent of arrear_months.';
