ALTER TABLE salary_payments ADD COLUMN IF NOT EXISTS unapproved_leave_days DECIMAL(5,2) DEFAULT 0.00;
COMMENT ON COLUMN salary_payments.unapproved_leave_days IS 'HR-entered manual LOP/unapproved leave days for the pay period; reduces paid_days only';
