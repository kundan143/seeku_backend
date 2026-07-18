ALTER TABLE users_master ADD COLUMN IF NOT EXISTS work_mobile VARCHAR(20);

COMMENT ON COLUMN users_master.work_mobile IS 'Official Work Mobile Number';
