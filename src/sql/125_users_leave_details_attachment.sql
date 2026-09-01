-- Same optional hardcopy-approval attachment as attendance_regularization (124) - the employee
-- can attach a scanned supporting document when applying for leave, for HR to review before
-- approving/rejecting.
ALTER TABLE users_leave_details ADD COLUMN IF NOT EXISTS attachment_url VARCHAR(500);
