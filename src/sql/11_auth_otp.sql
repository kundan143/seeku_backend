-- Add OTP columns for password reset flow
ALTER TABLE users_master ADD COLUMN IF NOT EXISTS reset_otp VARCHAR(6);
ALTER TABLE users_master ADD COLUMN IF NOT EXISTS reset_otp_expiry TIMESTAMP;
