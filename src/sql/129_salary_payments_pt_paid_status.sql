-- Same "mark as paid" tracking as pf_paid_status (121), esi_paid_status (126), and
-- income_tax_paid_status (128), for Professional Tax.
ALTER TABLE salary_payments ADD COLUMN IF NOT EXISTS pt_paid_status SMALLINT NOT NULL DEFAULT 0;
