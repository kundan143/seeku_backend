-- One row per "Set Up Your Account" credentials email actually sent (single or bulk), mirroring
-- salary_slip_mail_log/increment_letter_mail_log so it shows up in the same "Mail Log" audit
-- screen (OP_SalarySlipMailLog.js unions all three).
CREATE TABLE IF NOT EXISTS credentials_mail_log (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users_master(id),
  recipient_email VARCHAR(500) NOT NULL,
  subject VARCHAR(500),
  status SMALLINT NOT NULL DEFAULT 1,
  sent_by INTEGER REFERENCES users_master(id),
  sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE credentials_mail_log IS 'Audit log of "Set Up Your Account" credentials emails actually sent - one row per send.';
COMMENT ON COLUMN credentials_mail_log.user_id IS 'Employee the credentials email was for, references users_master.';
COMMENT ON COLUMN credentials_mail_log.recipient_email IS 'Email address the credentials mail was actually sent to.';
COMMENT ON COLUMN credentials_mail_log.status IS '1 = Sent, 0 = Failed.';
COMMENT ON COLUMN credentials_mail_log.sent_by IS 'User who triggered the send (single or bulk), references users_master.';
CREATE INDEX IF NOT EXISTS idx_credentials_mail_log_user_id ON credentials_mail_log(user_id);
