-- HR picks how many days an offer stays valid (3/5/10, offer_validity_days); offer_expiry_date
-- is computed server-side from offer_date + offer_validity_days (see OP_Candidates.js addData/
-- updateData) and printed on the Offer Letter. Any draft/sent offer whose expiry_date has passed
-- auto-flips to 'expired' the next time the Candidates list loads (see getAllData) - no cron job.
ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS offer_validity_days SMALLINT,
  ADD COLUMN IF NOT EXISTS offer_expiry_date DATE;

COMMENT ON COLUMN candidates.offer_validity_days IS 'How many days from offer_date the offer stays valid (e.g. 3, 5, 10)';
COMMENT ON COLUMN candidates.offer_expiry_date IS 'offer_date + offer_validity_days, computed server-side on save';
