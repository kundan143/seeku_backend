-- Same "mark as paid" tracking as pf_paid_status (121) and esi_paid_status (126), for TDS -
-- lets HR mark income tax as remitted to the tax authority for a given salary_payments row.
ALTER TABLE salary_payments ADD COLUMN IF NOT EXISTS income_tax_paid_status SMALLINT NOT NULL DEFAULT 0;
