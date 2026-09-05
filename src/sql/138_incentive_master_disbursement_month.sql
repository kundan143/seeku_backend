-- Re-adds disbursement_month (originally added in 67, dropped in 76 when the accrual cron
-- stopped gating on a specific due month). This time it's INFORMATIONAL ONLY - HR's own note
-- of which month a scheme is meant to pay out in, purely for reference in the Incentive Master
-- list/form. The accrual cron (accrueEmployeeIncentiveDetails.js) does NOT read this column and
-- keeps accruing every active scheme on every run exactly as it does today.
ALTER TABLE incentive_master ADD COLUMN IF NOT EXISTS disbursement_month INTEGER
  CHECK (disbursement_month IS NULL OR disbursement_month BETWEEN 1 AND 12);

COMMENT ON COLUMN incentive_master.disbursement_month IS 'Informational anchor month (1-12) HR expects this scheme to pay out in - NOT read by the accrual cron. Typically null for Monthly frequency (pays every month).';
