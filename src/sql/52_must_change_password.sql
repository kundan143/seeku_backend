ALTER TABLE users_master ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN users_master.must_change_password IS 'When true, user must set a new password before they can use the app (set on new-employee creation and when default credentials are emailed via sendMail)';
