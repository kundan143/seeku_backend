-- Same "mark as paid" tracking as pf_paid_status (121), for ESI - lets HR mark ESI as remitted
-- to ESIC for a given salary_payments row, separate from the salary's own payment_status.
ALTER TABLE salary_payments ADD COLUMN IF NOT EXISTS esi_paid_status SMALLINT NOT NULL DEFAULT 0;
