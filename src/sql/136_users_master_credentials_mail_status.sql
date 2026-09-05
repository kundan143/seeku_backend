-- Tracks whether/when the "Set Up Your Account" credentials email (OP_UsersMaster.js
-- sendCredentialsMail) was sent to an employee, mirroring salary_payments.mail_status/
-- mail_sent_date - lets bulk-sending skip employees who were already emailed.
ALTER TABLE users_master
  ADD COLUMN IF NOT EXISTS credentials_mail_status SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credentials_mail_sent_date TIMESTAMP;

COMMENT ON COLUMN users_master.credentials_mail_status IS '0 = Not Sent, 1 = Sent';
