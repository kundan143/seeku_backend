-- Labour Welfare Fund (LWF) - a small statutory deduction most states levy half-yearly
-- (commonly December), entered manually by HR at process-payroll time since there's no
-- per-employee LWF master data anywhere in the system yet.
ALTER TABLE salary_payments ADD COLUMN IF NOT EXISTS lwf_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN salary_payments.lwf_amount IS 'Labour Welfare Fund deduction for this payment, entered manually by HR (commonly only for the December run) and included in total_deductions/net_salary.';
