-- Optional hardcopy-approval attachment (scanned signed form etc.) the employee can attach when
-- raising an attendance regularization request, so HR has supporting evidence to review before
-- approving/rejecting - not required at submission (some requests won't have a hardcopy at all).
ALTER TABLE attendance_regularization ADD COLUMN IF NOT EXISTS attachment_url VARCHAR(500);
