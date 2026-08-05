-- Tracks whether a salary slip email has already gone out for this payment, so
-- bulk-send can skip rows already emailed. The per-row resend button ignores this.
ALTER TABLE salary_payments ADD COLUMN IF NOT EXISTS mail_status SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE salary_payments ADD COLUMN IF NOT EXISTS mail_sent_date TIMESTAMP;
COMMENT ON COLUMN salary_payments.mail_status IS '0 = Not Sent, 1 = Sent. Blocks bulk re-send only; the per-row resend button ignores this.';
COMMENT ON COLUMN salary_payments.mail_sent_date IS 'Timestamp of the most recent salary slip email send for this payment.';
