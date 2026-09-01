-- Tracks whether PF has actually been remitted to EPFO for a given salary_payments row,
-- separate from the salary's own payment_status (Pending/Paid/On Hold). Set via bulk
-- "Mark PF Paid" action on the Statutory Payments > PF Monthly screen.
ALTER TABLE salary_payments ADD COLUMN IF NOT EXISTS pf_paid_status SMALLINT NOT NULL DEFAULT 0;
