-- Tracks whether an increment has been reverted (rolled back to old_salary_snapshot) via
-- Employee Salary Master's Increment History "Revert to Previous" action. The history row
-- itself is kept (not soft-deleted) so the audit trail still shows the increment happened and
-- was later undone, rather than disappearing.
ALTER TABLE salary_increment_history ADD COLUMN IF NOT EXISTS is_reverted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE salary_increment_history ADD COLUMN IF NOT EXISTS reverted_by BIGINT REFERENCES users_master(id);
ALTER TABLE salary_increment_history ADD COLUMN IF NOT EXISTS reverted_date TIMESTAMP;

COMMENT ON COLUMN salary_increment_history.is_reverted IS 'TRUE once this increment has been rolled back to old_salary_snapshot.';
COMMENT ON COLUMN salary_increment_history.reverted_by IS 'User who reverted this increment, if any.';
COMMENT ON COLUMN salary_increment_history.reverted_date IS 'When this increment was reverted, if any.';
