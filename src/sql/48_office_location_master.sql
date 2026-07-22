-- Company locations (e.g. Head Office, Unit 1, Unit II, Unit III) with full postal address.
CREATE TABLE IF NOT EXISTS office_location_master (
  id BIGSERIAL PRIMARY KEY,
  location_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  full_address TEXT,
  city_id INTEGER REFERENCES city_master(id),
  state_id INTEGER REFERENCES state_master(id),
  pincode VARCHAR(20),
  status INTEGER NOT NULL DEFAULT 1,
  created_by INTEGER NOT NULL REFERENCES users_master(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_by INTEGER REFERENCES users_master(id),
  modified_date TIMESTAMP,
  deleted_by INTEGER REFERENCES users_master(id),
  deleted_date TIMESTAMP
);

COMMENT ON TABLE office_location_master IS 'Company locations/units (e.g. Head Office, Unit 1, Unit II, Unit III) with full postal address.';
COMMENT ON COLUMN office_location_master.location_code IS 'Short unique code identifying the location, e.g. HO, U1, U2';
COMMENT ON COLUMN office_location_master.name IS 'Location label, e.g. Head Office, Unit 1, Unit II, Unit III';
COMMENT ON COLUMN office_location_master.full_address IS 'Full street address of the location';
COMMENT ON COLUMN office_location_master.city_id IS 'City this location is in (references city_master.id)';
COMMENT ON COLUMN office_location_master.state_id IS 'State this location is in (references state_master.id)';
COMMENT ON COLUMN office_location_master.pincode IS 'Postal/PIN code';
COMMENT ON COLUMN office_location_master.status IS 'Status indicator (1 = Active, 0 = Deleted)';
COMMENT ON COLUMN office_location_master.created_by IS 'User ID who created the record (references users_master.id)';
COMMENT ON COLUMN office_location_master.created_date IS 'Timestamp when the record was created';
COMMENT ON COLUMN office_location_master.modified_by IS 'User ID who last modified the record (references users_master.id)';
COMMENT ON COLUMN office_location_master.modified_date IS 'Timestamp when the record was last modified';
COMMENT ON COLUMN office_location_master.deleted_by IS 'User ID who deleted the record (references users_master.id)';
COMMENT ON COLUMN office_location_master.deleted_date IS 'Timestamp when the record was deleted';

-- Employee's assigned location (optional; existing employees have no location until set).
ALTER TABLE users_master ADD COLUMN IF NOT EXISTS location_id INTEGER REFERENCES office_location_master(id);
COMMENT ON COLUMN users_master.location_id IS 'Location/unit this employee is assigned to (references office_location_master.id)';
