ALTER TABLE client_branding_master ADD COLUMN IF NOT EXISTS client_favicon VARCHAR(255);
ALTER TABLE client_branding_master ADD COLUMN IF NOT EXISTS client_primary_color VARCHAR(20);
ALTER TABLE client_branding_master ADD COLUMN IF NOT EXISTS client_tagline VARCHAR(255);
ALTER TABLE client_branding_master ADD COLUMN IF NOT EXISTS support_email VARCHAR(255);
ALTER TABLE client_branding_master ADD COLUMN IF NOT EXISTS support_phone VARCHAR(20);

COMMENT ON COLUMN client_branding_master.client_favicon IS 'File path of the uploaded client favicon image (served from /uploads)';
COMMENT ON COLUMN client_branding_master.client_primary_color IS 'Hex color code used to override the PrimeNG --primary-color theme variable';
COMMENT ON COLUMN client_branding_master.client_tagline IS 'Short client/company tagline shown alongside the client name';
COMMENT ON COLUMN client_branding_master.support_email IS 'Client support contact email address';
COMMENT ON COLUMN client_branding_master.support_phone IS 'Client support contact phone number';
