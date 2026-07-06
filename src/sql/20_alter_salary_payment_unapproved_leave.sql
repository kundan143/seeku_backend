ALTER TABLE salary_payments ADD COLUMN IF NOT EXISTS unapproved_leave_days DECIMAL(5,2) DEFAULT 0.00;
COMMENT ON COLUMN salary_payments.unapproved_leave_days IS 'HR-entered manual LOP/unapproved leave days for the pay period; reduces paid_days only';

ALTER TABLE public.org_contact_person
ADD COLUMN is_copied INTEGER DEFAULT 0;

COMMENT ON COLUMN public.org_contact_person.is_copied IS 'Flag indicating whether this contact person record was created via the copy-organization-contacts feature (1 = copied, 0/null = original)';

