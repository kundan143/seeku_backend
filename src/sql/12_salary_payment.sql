-- ============================================================
--  Table: salary_payments
--  Description: Records actual monthly salary disbursements to employees
-- ============================================================

CREATE TABLE salary_payments (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users_master(id),            -- NULL when other_user_name is used
    other_user_name VARCHAR(255),                                  -- Name for employees not in system

    -- Reference to the salary structure used for this payment
    salary_detail_id BIGINT REFERENCES users_salary_details(id),

    -- Pay period
    payment_month   SMALLINT    NOT NULL,                          -- 1–12
    payment_year    SMALLINT    NOT NULL,                          -- e.g. 2025

    -- Earnings (snapshot at time of payment)
    basic_salary            DECIMAL(12,2) DEFAULT 0.00,
    dearness_allowance      DECIMAL(12,2) DEFAULT 0.00,
    city_allowance          DECIMAL(12,2) DEFAULT 0.00,
    hra                     DECIMAL(12,2) DEFAULT 0.00,
    conveyance              DECIMAL(12,2) DEFAULT 0.00,
    medical_allowance       DECIMAL(12,2) DEFAULT 0.00,
    lta                     DECIMAL(12,2) DEFAULT 0.00,
    special_allowance       DECIMAL(12,2) DEFAULT 0.00,
    bonus                   DECIMAL(12,2) DEFAULT 0.00,

    -- Deductions
    pf_employee             DECIMAL(12,2) DEFAULT 0.00,
    professional_tax        DECIMAL(12,2) DEFAULT 0.00,
    income_tax              DECIMAL(12,2) DEFAULT 0.00,
    employee_state_insurance DECIMAL(12,2) DEFAULT 0.00,
    loan_deduction          DECIMAL(12,2) DEFAULT 0.00,
    other_deduction         DECIMAL(12,2) DEFAULT 0.00,

    -- Employer contributions
    pf_employer             DECIMAL(12,2) DEFAULT 0.00,
    esi_employer            DECIMAL(12,2) DEFAULT 0.00,
    gratuity                DECIMAL(12,2) DEFAULT 0.00,

    -- Computed totals
    gross_salary            DECIMAL(12,2) DEFAULT 0.00,
    total_deductions        DECIMAL(12,2) DEFAULT 0.00,
    net_salary              DECIMAL(12,2) DEFAULT 0.00,

    -- Attendance-based adjustment
    working_days    SMALLINT       DEFAULT 0,                      -- Total working days in the month
    present_days    DECIMAL(5,2)   DEFAULT 0.00,                   -- Days employee was present
    paid_days       DECIMAL(5,2)   DEFAULT 0.00,                   -- Days for which salary is calculated

    -- Payment details
    payment_mode    VARCHAR(50),                                   -- Cash | Bank Transfer | Cheque | NEFT | IMPS | UPI
    payment_date    DATE,
    transaction_ref VARCHAR(255),                                  -- Bank ref / cheque number
    remarks         TEXT,
    payment_status  SMALLINT    DEFAULT 0,                         -- 0=Pending  1=Paid  2=On Hold

    -- Soft-delete + audit
    status          SMALLINT    DEFAULT 1,                         -- 1=Active  0=Deleted
    created_by      BIGINT REFERENCES users_master(id),
    created_date    TIMESTAMP,
    modified_by     BIGINT REFERENCES users_master(id),
    modified_date   TIMESTAMP,
    deleted_by      BIGINT REFERENCES users_master(id),
    deleted_date    TIMESTAMP
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_salary_payments_user        ON salary_payments(user_id);
CREATE INDEX idx_salary_payments_period      ON salary_payments(payment_year, payment_month);
CREATE INDEX idx_salary_payments_status      ON salary_payments(payment_status);

-- ── Comments ──────────────────────────────────────────────────────────────────
COMMENT ON TABLE  salary_payments                    IS 'Monthly salary payment records for employees';
COMMENT ON COLUMN salary_payments.payment_month      IS '1–12 representing the salary month';
COMMENT ON COLUMN salary_payments.payment_year       IS 'Four-digit year of the salary period';
COMMENT ON COLUMN salary_payments.payment_status     IS '0=Pending, 1=Paid, 2=On Hold';
COMMENT ON COLUMN salary_payments.paid_days          IS 'Actual days for salary calculation (can differ from present_days due to LOP policy)';
COMMENT ON COLUMN salary_payments.salary_detail_id   IS 'FK to users_salary_details — snapshot source at time of payment';


-- ============================================================
--  Menu entry: Salary Payment under HR Module
-- ============================================================
WITH hr_parent AS (
    SELECT id FROM menu_master WHERE menu_name = 'HR Module' AND parent_id IS NULL LIMIT 1
)
INSERT INTO menu_master (parent_id, menu_name, link, icon, parent_rank, child_rank)
SELECT hr_parent.id, 'Salary Payment', '/hr/salary-payment', 'pi pi-fw pi-wallet', 5, 8
FROM hr_parent
WHERE NOT EXISTS (
    SELECT 1 FROM menu_master WHERE menu_name = 'Salary Payment'
);

-- Grant full access to all admin users (role_id = 1)
INSERT INTO menu_permission (designation_id, menu_id, add_opt, edit_opt, view_opt, delete_opt, user_id, is_active, created_by, created_date)
SELECT
    um.designation_id,
    mm.id,
    1, 1, 1, 1,
    um.id,
    1,
    um.id,
    NOW()
FROM menu_master mm
CROSS JOIN users_master um
WHERE mm.link = '/hr/salary-payment'
  AND um.role_id = 1
  AND um.account_block = FALSE
  AND NOT EXISTS (
      SELECT 1 FROM menu_permission mp
      WHERE mp.menu_id = mm.id AND mp.user_id = um.id
  );
