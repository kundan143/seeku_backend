-- ============================================================
--  Table: candidates
--  Description: Candidate records for offer-letter generation and
--               tracking through the hiring workflow, up to conversion
--               into a full employee (users_master) record.
-- ============================================================

CREATE TABLE candidates (
    id                  BIGSERIAL PRIMARY KEY,
    first_name          VARCHAR(255) NOT NULL,
    last_name           VARCHAR(255) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    mobile              VARCHAR(255) NOT NULL,

    department_id       INTEGER REFERENCES department_master(id),
    designation_id      INTEGER REFERENCES designation_master(id),
    reporting_manager_id BIGINT REFERENCES users_master(id),

    doj                 DATE,                                  -- proposed date of joining
    offer_date          DATE,                                  -- date the offer letter is issued

    -- Salary breakup (monthly figures, mirrors users_salary_details for direct reuse on conversion)
    basic_salary             DECIMAL(12,2) DEFAULT 0.00,
    dearness_allowance       DECIMAL(12,2) DEFAULT 0.00,
    city_allowance           DECIMAL(12,2) DEFAULT 0.00,
    hra                      DECIMAL(12,2) DEFAULT 0.00,
    conveyance               DECIMAL(12,2) DEFAULT 0.00,
    medical_allowance        DECIMAL(12,2) DEFAULT 0.00,
    lta                      DECIMAL(12,2) DEFAULT 0.00,
    special_allowance        DECIMAL(12,2) DEFAULT 0.00,
    bonus                    DECIMAL(12,2) DEFAULT 0.00,

    pf_employee              DECIMAL(12,2) DEFAULT 0.00,
    professional_tax         DECIMAL(12,2) DEFAULT 0.00,
    income_tax               DECIMAL(12,2) DEFAULT 0.00,
    employee_state_insurance DECIMAL(12,2) DEFAULT 0.00,
    loan_deduction           DECIMAL(12,2) DEFAULT 0.00,
    other_deduction          DECIMAL(12,2) DEFAULT 0.00,

    pf_employer              DECIMAL(12,2) DEFAULT 0.00,
    esi_employer              DECIMAL(12,2) DEFAULT 0.00,
    gratuity                 DECIMAL(12,2) DEFAULT 0.00,

    gross_salary             DECIMAL(12,2) DEFAULT 0.00,
    total_deductions         DECIMAL(12,2) DEFAULT 0.00,
    net_salary               DECIMAL(12,2) DEFAULT 0.00,
    ctc                      DECIMAL(12,2) DEFAULT 0.00,        -- Annual CTC shown on the offer letter

    -- Hiring workflow
    offer_status        VARCHAR(20) DEFAULT 'draft',            -- draft | sent | accepted | rejected | withdrawn | converted
    offer_letter_url    TEXT,
    converted_user_id   BIGINT REFERENCES users_master(id),     -- set once converted to an employee
    terms               TEXT,                                   -- extra terms/notes appended to the letter

    -- Soft-delete + audit
    status              SMALLINT DEFAULT 1,                     -- 1=Active  0=Deleted
    created_by          BIGINT REFERENCES users_master(id),
    created_date        TIMESTAMP,
    modified_by         BIGINT REFERENCES users_master(id),
    modified_date       TIMESTAMP,
    deleted_by          BIGINT REFERENCES users_master(id),
    deleted_date        TIMESTAMP
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_candidates_status         ON candidates(status);
CREATE INDEX idx_candidates_offer_status   ON candidates(offer_status);
CREATE INDEX idx_candidates_department     ON candidates(department_id);
CREATE INDEX idx_candidates_email          ON candidates(email);

-- ── Comments ──────────────────────────────────────────────────────────────────
COMMENT ON TABLE  candidates                   IS 'Candidate offer-letter records, tracked through the hiring workflow';
COMMENT ON COLUMN candidates.offer_status      IS 'draft, sent, accepted, rejected, withdrawn, converted';
COMMENT ON COLUMN candidates.converted_user_id IS 'FK to users_master once the candidate is converted to an employee';
COMMENT ON COLUMN candidates.status            IS '1=Active, 0=Deleted (soft delete)';


-- ============================================================
--  Menu entry: Candidates / Offer Letters under HR Module
-- ============================================================
WITH hr_parent AS (
    SELECT id FROM menu_master WHERE menu_name = 'HR' AND parent_id IS NULL LIMIT 1
)
INSERT INTO menu_master (parent_id, menu_name, link, icon, parent_rank, child_rank)
SELECT hr_parent.id, 'Offer Letters', '/hr/offer-letters', 'pi pi-fw pi-file-edit', 5, 9
FROM hr_parent
WHERE NOT EXISTS (
    SELECT 1 FROM menu_master WHERE menu_name = 'Offer Letters'
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
WHERE mm.link = '/hr/offer-letters'
  AND um.role_id = 1
  AND um.account_block = FALSE
  AND NOT EXISTS (
      SELECT 1 FROM menu_permission mp
      WHERE mp.menu_id = mm.id AND mp.user_id = um.id
  );
