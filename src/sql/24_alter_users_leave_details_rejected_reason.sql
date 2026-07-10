ALTER TABLE users_leave_details ADD COLUMN IF NOT EXISTS rejected_reason TEXT;

COMMENT ON COLUMN users_leave_details.rejected_reason IS 'Reason entered by the approver explaining why the leave request was rejected';
