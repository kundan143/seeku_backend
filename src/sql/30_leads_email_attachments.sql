ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_attachments TEXT[] DEFAULT '{}';

COMMENT ON COLUMN leads.email_attachments IS 'File name(s) of enquiry email(s) dragged in from Outlook (.msg/.eml), tracked alongside lead_documents';
