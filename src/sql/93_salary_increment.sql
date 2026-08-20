-- Salary Increment scheme: a one-off increment event for a single employee. Applying an
-- increment (see OP_SalaryIncrement.addData) both bumps the employee's current
-- users_salary_details row in place and snapshots the old/new gross here, along with the
-- back-pay ("arrears") owed for the months between effective_from and whenever the increment
-- is actually keyed in. Arrears are paid as a single lump sum via payout_month_id/payout_year
-- (set later through the same generic "Select Month" update pattern used by
-- employee_incentive_details.disbursed_month_id), which OP_salaryPayment.js joins into that
-- month's bulk payroll run. Flattened (no separate scheme/ledger split) since an increment is
-- a one-off event, not a recurring accrual — mirrors the current employee_incentive_details shape.
CREATE TABLE IF NOT EXISTS salary_increment_master (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users_master(id),
  salary_detail_id BIGINT REFERENCES users_salary_details(id),

  increment_type VARCHAR(20) NOT NULL CHECK (increment_type IN ('percentage', 'flat')),
  increment_value NUMERIC(12, 2) NOT NULL,
  effective_from DATE NOT NULL,

  old_gross_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  new_gross_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  monthly_increment_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,

  arrear_months INTEGER NOT NULL DEFAULT 0,
  total_arrear_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payout_month_id SMALLINT CHECK (payout_month_id IS NULL OR payout_month_id BETWEEN 1 AND 12),
  payout_year SMALLINT,
  arrear_paid_status SMALLINT NOT NULL DEFAULT 0,

  remarks TEXT,
  status SMALLINT NOT NULL DEFAULT 1,

  created_by BIGINT REFERENCES users_master(id),
  created_date TIMESTAMP,
  modified_by BIGINT REFERENCES users_master(id),
  modified_date TIMESTAMP,
  deleted_by BIGINT REFERENCES users_master(id),
  deleted_date TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_salary_increment_user ON salary_increment_master(user_id);
CREATE INDEX IF NOT EXISTS idx_salary_increment_status ON salary_increment_master(status);
CREATE INDEX IF NOT EXISTS idx_salary_increment_payout ON salary_increment_master(payout_year, payout_month_id);

COMMENT ON TABLE salary_increment_master IS 'One-off salary increment events per employee, with computed arrears for months between effective_from and when the increment is keyed in.';
COMMENT ON COLUMN salary_increment_master.salary_detail_id IS 'users_salary_details row that was updated in place when this increment was applied.';
COMMENT ON COLUMN salary_increment_master.increment_type IS 'percentage: increment_value is a % applied to gross; flat: increment_value is a flat monthly amount added to gross.';
COMMENT ON COLUMN salary_increment_master.old_gross_salary IS 'Monthly gross salary snapshot before the increment.';
COMMENT ON COLUMN salary_increment_master.new_gross_salary IS 'Monthly gross salary snapshot after the increment.';
COMMENT ON COLUMN salary_increment_master.arrear_months IS 'Number of months (effective_from up to the increment being keyed in) that were already paid at the old rate and are owed as arrears.';
COMMENT ON COLUMN salary_increment_master.total_arrear_amount IS 'monthly_increment_amount * arrear_months — paid as a single lump sum in payout_month_id/payout_year.';
COMMENT ON COLUMN salary_increment_master.payout_month_id IS '1=January..12=December — the payroll month the arrears lump sum should be added to. NULL = not yet scheduled.';
COMMENT ON COLUMN salary_increment_master.arrear_paid_status IS '0 = arrears pending payout, 1 = already folded into a processed payroll run (see OP_salaryPayment.processBulkPayroll).';
COMMENT ON COLUMN salary_increment_master.status IS '1 = Active, 0 = Deleted (soft delete).';

-- ============================================================
--  Menu entry: Salary Increment under HR Module
-- ============================================================
WITH hr_parent AS (
    SELECT id FROM menu_master WHERE menu_name = 'HR' AND parent_id IS NULL LIMIT 1
)
INSERT INTO menu_master (parent_id, menu_name, link, icon, parent_rank, child_rank)
SELECT hr_parent.id, 'Salary Increment', '/hr/salary-increment', 'pi pi-fw pi-arrow-up-right', 5, 12
FROM hr_parent
WHERE NOT EXISTS (
    SELECT 1 FROM menu_master WHERE menu_name = 'Salary Increment'
);

-- Clone whoever already has access to Salary Payment (the closest sibling HR menu item),
-- same pattern as 84_cable_spec_document_menu.sql / 86_conductor_insulation_design_menu.sql.
INSERT INTO menu_permission (user_id, menu_id, add_opt, edit_opt, view_opt, delete_opt, excel_opt, pdf_opt, approve_opt, mailsent_opt, password_protect_opt, role_id, is_active, created_by, created_date)
SELECT mp.user_id, mm.id, mp.add_opt, mp.edit_opt, mp.view_opt, mp.delete_opt, mp.excel_opt, mp.pdf_opt, mp.approve_opt, mp.mailsent_opt, mp.password_protect_opt, mp.role_id, mp.is_active, mp.created_by, CURRENT_TIMESTAMP
FROM menu_permission mp
JOIN menu_master sibling ON sibling.id = mp.menu_id AND sibling.link = '/hr/salary-payment'
JOIN menu_master mm ON mm.link = '/hr/salary-increment'
WHERE NOT EXISTS (
    SELECT 1 FROM menu_permission existing WHERE existing.menu_id = mm.id AND existing.user_id = mp.user_id
);
