ALTER TABLE lead_tracking_log ADD COLUMN IF NOT EXISTS remarks TEXT;

COMMENT ON COLUMN lead_tracking_log.remarks IS 'Mandatory remark entered by the user explaining why the lead was moved to this stage';
