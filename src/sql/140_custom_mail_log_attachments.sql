-- Records which uploaded files (if any) were attached to a Custom Mail send, for audit purposes.
-- Stored as a comma-joined list of /uploads/... paths, matching how the file upload endpoint
-- returns multiple paths (api/file/upload's `paths` array) - not surfaced as a clickable
-- document icon in the Mail Log table today (unlike document_url), just kept for the record.
ALTER TABLE custom_mail_log ADD COLUMN IF NOT EXISTS attachment_urls TEXT;
COMMENT ON COLUMN custom_mail_log.attachment_urls IS 'Comma-joined /uploads/... paths of files attached to this send, if any.';
