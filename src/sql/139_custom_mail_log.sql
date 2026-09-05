-- Ad-hoc emails sent via the reusable Mail Compose dialog (Mail Log's "Compose" button) - not
-- tied to any specific employee/candidate/payment record, unlike the other three mail_log
-- tables, so there's no user_id/employee_name here. Unioned into OP_SalarySlipMailLog.js's
-- getAllData as mail_type = 'Custom Mail'.
CREATE TABLE IF NOT EXISTS custom_mail_log (
  id BIGSERIAL PRIMARY KEY,
  recipient_email VARCHAR(1000) NOT NULL,
  cc VARCHAR(1000),
  bcc VARCHAR(1000),
  subject VARCHAR(500),
  body TEXT,
  status SMALLINT NOT NULL DEFAULT 1,
  sent_by INTEGER REFERENCES users_master(id),
  sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE custom_mail_log IS 'Audit log of ad-hoc emails sent via the Mail Compose dialog - one row per send.';
COMMENT ON COLUMN custom_mail_log.recipient_email IS 'To address(es), comma-joined when more than one.';
COMMENT ON COLUMN custom_mail_log.cc IS 'Cc address(es), comma-joined when more than one.';
COMMENT ON COLUMN custom_mail_log.bcc IS 'Bcc address(es), comma-joined when more than one.';
COMMENT ON COLUMN custom_mail_log.status IS '1 = Sent, 0 = Failed.';
COMMENT ON COLUMN custom_mail_log.sent_by IS 'User who composed and sent this email, references users_master.';
