-- One row per salary slip email actually sent (bulk or per-row resend), for the
-- "who received mail and what he received" audit screen.
CREATE TABLE IF NOT EXISTS salary_slip_mail_log (
  id BIGSERIAL PRIMARY KEY,
  salary_payment_id INTEGER NOT NULL REFERENCES salary_payments(id),
  user_id INTEGER NOT NULL REFERENCES users_master(id),
  recipient_email VARCHAR(500) NOT NULL,
  subject VARCHAR(500),
  payment_month SMALLINT,
  payment_year SMALLINT,
  slip_url VARCHAR(500),
  status SMALLINT NOT NULL DEFAULT 1,
  sent_by INTEGER REFERENCES users_master(id),
  sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE salary_slip_mail_log IS 'Audit log of salary slip emails actually sent - one row per send.';
COMMENT ON COLUMN salary_slip_mail_log.salary_payment_id IS 'Salary payment this email was for, references salary_payments.';
COMMENT ON COLUMN salary_slip_mail_log.user_id IS 'Employee the slip belongs to, references users_master.';
COMMENT ON COLUMN salary_slip_mail_log.recipient_email IS 'Email address(es) the slip was actually sent to.';
COMMENT ON COLUMN salary_slip_mail_log.slip_url IS 'Path to the exact PDF slip that was attached to this email.';
COMMENT ON COLUMN salary_slip_mail_log.status IS '1 = Sent, 0 = Failed.';
COMMENT ON COLUMN salary_slip_mail_log.sent_by IS 'User who triggered the send (bulk or per-row), references users_master.';
CREATE INDEX IF NOT EXISTS idx_slip_mail_log_salary_payment_id ON salary_slip_mail_log(salary_payment_id);
CREATE INDEX IF NOT EXISTS idx_slip_mail_log_user_id ON salary_slip_mail_log(user_id);
