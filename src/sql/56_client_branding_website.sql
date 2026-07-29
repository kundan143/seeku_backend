ALTER TABLE client_branding_master ADD COLUMN IF NOT EXISTS client_website VARCHAR(255);

COMMENT ON COLUMN client_branding_master.client_website IS 'Client/customer company website URL';
