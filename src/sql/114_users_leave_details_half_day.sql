-- total_days is already NUMERIC(5,2) ("supports half-day, quarter-day etc." per its original
-- comment in 03_leave_type_master.sql) but nothing ever set it to anything but a whole number.
-- This adds an explicit flag so a half-day leave is queryable/reportable on its own, not just
-- inferred from total_days ending in .5.
ALTER TABLE users_leave_details ADD COLUMN IF NOT EXISTS is_half_day BOOLEAN NOT NULL DEFAULT false;