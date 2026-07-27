ALTER TABLE office_location_master ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE office_location_master ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE office_location_master ADD COLUMN IF NOT EXISTS is_registered_office BOOLEAN NOT NULL DEFAULT false;

-- Only one location should be flagged as the registered office at a time.
CREATE UNIQUE INDEX IF NOT EXISTS office_location_master_one_registered_office
  ON office_location_master ((is_registered_office))
  WHERE is_registered_office = true AND status = 1;

COMMENT ON COLUMN office_location_master.phone IS 'Contact phone number for this location';
COMMENT ON COLUMN office_location_master.email IS 'Contact email address for this location';
COMMENT ON COLUMN office_location_master.is_registered_office IS 'Flags this location as the company''s statutory registered office, printed on documents such as salary slips';
