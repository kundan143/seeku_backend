-- Incentive payout frequency (Monthly/Quarterly/Half-Yearly/Yearly). The entered
-- incentive_value is treated as the annual/total figure; the UI divides it by the
-- frequency's periods-per-year to show the per-installment amount (display-only -
-- no separate payment/installment rows are generated).
ALTER TABLE incentive_master ADD COLUMN IF NOT EXISTS frequency VARCHAR(20) NOT NULL DEFAULT 'yearly'
  CHECK (frequency IN ('monthly', 'quarterly', 'half_yearly', 'yearly'));

COMMENT ON COLUMN incentive_master.frequency IS 'Payout frequency - incentive_value is divided by this frequency''s periods-per-year for display (12/4/2/1)';
