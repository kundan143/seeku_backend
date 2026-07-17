-- username is no longer used: login is by email/emp_code only, and application code no longer reads or writes this column.
ALTER TABLE users_master DROP COLUMN IF EXISTS username;
