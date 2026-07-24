-- ============================================================
--  Add a per-user "password protect" opt to menu_permission
--  (same pattern as excel_opt/pdf_opt/approve_opt/mailsent_opt),
--  plus the shared lock credential + lockout state on menu_master.
-- ============================================================

ALTER TABLE menu_permission ADD COLUMN IF NOT EXISTS password_protect_opt INTEGER NOT NULL DEFAULT 0;
COMMENT ON COLUMN menu_permission.password_protect_opt IS 'When 1, this user must unlock the shared component password before viewing this menu item';

ALTER TABLE menu_master ADD COLUMN IF NOT EXISTS lock_email VARCHAR(255);
ALTER TABLE menu_master ADD COLUMN IF NOT EXISTS lock_password_hash TEXT;
ALTER TABLE menu_master ADD COLUMN IF NOT EXISTS lock_failed_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE menu_master ADD COLUMN IF NOT EXISTS lock_locked_until TIMESTAMP;

COMMENT ON COLUMN menu_master.lock_email IS 'Recipient of the component-lock activity report; also part of the shared unlock credential';
COMMENT ON COLUMN menu_master.lock_password_hash IS 'bcrypt hash of the shared unlock password for this component';
COMMENT ON COLUMN menu_master.lock_failed_attempts IS 'Consecutive failed unlock attempts against the shared credential';
COMMENT ON COLUMN menu_master.lock_locked_until IS 'If set and in the future, the shared credential is temporarily locked out';
