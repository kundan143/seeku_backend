-- Daily counter used to generate emp_code (YYMMDD + 4-digit sequence, resets each day)
CREATE TABLE IF NOT EXISTS emp_code_counter (
  code_date DATE PRIMARY KEY,
  last_seq INTEGER NOT NULL DEFAULT 0
);

COMMENT ON TABLE emp_code_counter IS 'Tracks the last-used sequence number per day for generating emp_code (resets daily)';

ALTER TABLE users_master ADD COLUMN IF NOT EXISTS emp_code VARCHAR(20) UNIQUE;

COMMENT ON COLUMN users_master.emp_code IS 'Unique employee code, auto-generated as YYMMDD + 4-digit daily sequence (e.g. 2607150001)';
