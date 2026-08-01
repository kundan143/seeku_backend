-- Anchor month (1-12) the incentive actually disburses in. Combined with frequency, the
-- remaining disbursement months are inferred (Yearly = this month only; Half-Yearly = this
-- month + 6; Quarterly = this month, +3, +6, +9). Not applicable to Monthly (every month),
-- so nullable.
ALTER TABLE incentive_master ADD COLUMN IF NOT EXISTS disbursement_month INTEGER
  CHECK (disbursement_month IS NULL OR disbursement_month BETWEEN 1 AND 12);

COMMENT ON COLUMN incentive_master.disbursement_month IS 'Anchor month (1-12) for disbursement; other periods inferred from frequency. NULL when frequency = monthly.';
