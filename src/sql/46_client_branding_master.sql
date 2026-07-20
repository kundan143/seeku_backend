CREATE TABLE IF NOT EXISTS client_branding_master (
  id INTEGER PRIMARY KEY,
  client_name VARCHAR(255),
  client_logo VARCHAR(255),
  created_by INTEGER REFERENCES users_master(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_by INTEGER REFERENCES users_master(id),
  modified_date TIMESTAMP
);

INSERT INTO client_branding_master (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE client_branding_master IS 'Single-row settings table holding the client company''s display name and logo, shown in the topbar alongside the Seeku product brand.';
COMMENT ON COLUMN client_branding_master.client_name IS 'Client/customer company name to display in the topbar';
COMMENT ON COLUMN client_branding_master.client_logo IS 'File path of the uploaded client logo image (served from /uploads)';
