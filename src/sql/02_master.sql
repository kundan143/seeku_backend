-- GENDER MASTER
-- =========================
CREATE TABLE IF NOT EXISTS gender_master (
    id SERIAL PRIMARY KEY,
    gender_name VARCHAR(50) NOT NULL UNIQUE
);

COMMENT ON TABLE gender_master IS 'Master table for gender options';
COMMENT ON COLUMN gender_master.id IS 'Primary Key';
COMMENT ON COLUMN gender_master.gender_name IS 'Gender Name (e.g., Male, Female, Other)';

-- Optional: Seed data
INSERT INTO gender_master (gender_name)
SELECT g FROM (VALUES ('Male'), ('Female'), ('Other')) AS t(g)
WHERE NOT EXISTS (SELECT 1 FROM gender_master);

CREATE TABLE IF NOT EXISTS blood_group_master (
    id SERIAL PRIMARY KEY,
    blood_group_name VARCHAR(10) NOT NULL UNIQUE
);

-- Optional: Add some standard blood groups
INSERT INTO blood_group_master (blood_group_name) VALUES
('A+'),
('A-'),
('B+'),
('B-'),
('AB+'),
('AB-'),
('O+'),
('O-');

COMMENT ON TABLE blood_group_master IS 'Stores standard blood group types';
COMMENT ON COLUMN blood_group_master.id IS 'Primary key (auto-increment)';
COMMENT ON COLUMN blood_group_master.blood_group_name IS 'Blood group name (e.g., A+, O-, AB+)';

CREATE TABLE IF NOT EXISTS emp_type_master (
    id SERIAL PRIMARY KEY,
    emp_type_name VARCHAR(100) NOT NULL UNIQUE
);
INSERT INTO emp_type_master (emp_type_name) VALUES
('Permanent'),
('Contract'),
('Intern'),
('Part-Time'),
('Consultant'),
('Temporary')
ON CONFLICT (emp_type_name) DO NOTHING;
COMMENT ON TABLE emp_type_master IS 'Master table for different employment types';
COMMENT ON COLUMN emp_type_master.id IS 'Primary Key';
COMMENT ON COLUMN emp_type_master.emp_type_name IS 'Employment Type Name (e.g., Permanent, Contract)';

CREATE TABLE IF NOT EXISTS designation_master (
    id SERIAL PRIMARY KEY,
    designation VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO designation_master (designation) VALUES
-- Production / Manufacturing
('Machine Operator'),
('Production Supervisor'),
('Shift In-Charge'),
('Production Manager'),
('Plant Head / Factory Manager'),

-- Quality & Testing
('Quality Inspector'),
('Lab Technician'),
('QA/QC Engineer'),
('Quality Manager'),

-- Maintenance
('Electrician'),
('Fitter / Technician'),
('Maintenance Engineer'),
('Maintenance Manager'),

-- Design & R&D
('Draftsman'),
('Design Engineer'),
('R&D Engineer'),
('R&D Manager'),

-- Logistics & Stores
('Store Keeper'),
('Inventory Controller'),
('Warehouse Supervisor'),
('Supply Chain Manager'),

-- Sales & Marketing
('Sales Executive'),
('Sales Manager'),
('Marketing Executive'),
('Business Development Manager'),

-- Accounts & Admin
('Accounts Executive'),
('HR Executive'),
('HR Manager'),
('Admin Officer'),

-- IT & Support
('IT Support Engineer'),
('ERP Coordinator'),
('System Administrator'),

-- Top Management
('Assistant Manager'),
('Deputy Manager'),
('General Manager (GM)'),
('Vice President (VP)'),
('Director'),
('Managing Director (MD)');

CREATE TABLE IF NOT EXISTS department_master (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO department_master (name) VALUES
('Production / Manufacturing'),
('Quality & Testing'),
('Maintenance'),
('Design & R&D'),
('Logistics & Stores'),
('Sales & Marketing'),
('Accounts & Admin'),
('IT & Support'),
('Top Management');

-- ==============================
-- MARITAL STATUS MASTER
-- ==============================
CREATE TABLE IF NOT EXISTS marital_status_master (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE
);

COMMENT ON TABLE marital_status_master IS 'Master table for marital status options';
COMMENT ON COLUMN marital_status_master.id IS 'Primary key';
COMMENT ON COLUMN marital_status_master.status_name IS 'Marital status name (e.g., Single, Married)';

-- Seed data
INSERT INTO marital_status_master (status_name) VALUES
('Single'),
('Married'),
('Divorced'),
('Widowed')
ON CONFLICT (status_name) DO NOTHING;
-- =========================

-- =============================
-- RELATION MASTER TABLE WITH AUDIT AND STATUS
-- =============================
CREATE TABLE IF NOT EXISTS relation_master (
    id SERIAL PRIMARY KEY,
    relation_name VARCHAR(100) NOT NULL UNIQUE,
    
    -- Status and soft delete
    status BOOLEAN DEFAULT TRUE,                     -- TRUE = Active, FALSE = Inactive/Deleted
    deleted_by INTEGER REFERENCES users_master(id),
    deleted_date TIMESTAMP WITHOUT TIME ZONE,
    
    -- Audit columns
    created_by INTEGER REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP WITHOUT TIME ZONE
);

-- =============================
-- COMMENTS
-- =============================
COMMENT ON TABLE relation_master IS 'Master table for types of relations in emergency contacts with audit, status, and soft delete info';
COMMENT ON COLUMN relation_master.id IS 'Primary Key';
COMMENT ON COLUMN relation_master.relation_name IS 'Relation name (e.g., Father, Spouse, Guardian)';
COMMENT ON COLUMN relation_master.status IS 'Record status: TRUE = Active, FALSE = Inactive/Deleted';
COMMENT ON COLUMN relation_master.deleted_by IS 'User who deleted the record';
COMMENT ON COLUMN relation_master.deleted_date IS 'Timestamp when record was deleted';
COMMENT ON COLUMN relation_master.created_by IS 'User who created the record';
COMMENT ON COLUMN relation_master.created_date IS 'Record creation timestamp';
COMMENT ON COLUMN relation_master.modified_by IS 'User who last modified the record';
COMMENT ON COLUMN relation_master.modified_date IS 'Record last modified timestamp';

-- =============================
-- Optional: Seed default values
-- =============================
INSERT INTO relation_master (relation_name)
VALUES 
('Father'),
('Mother'),
('Spouse'),
('Brother'),
('Sister'),
('Friend'),
('Guardian')
ON CONFLICT (relation_name) DO NOTHING;



CREATE TABLE IF NOT EXISTS users_master (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    mobile VARCHAR(100) NOT NULL,
    email VARCHAR(250) NOT NULL,                     -- personal email
    work_email VARCHAR(150),                        -- official email
    dob DATE NOT NULL,
    gender_id INTEGER NOT NULL REFERENCES gender_master (id),
    marital_status_id INTEGER NOT NULL REFERENCES marital_status_master (id),
    blood_group_id INTEGER NOT NULL REFERENCES blood_group_master (id),
    nationality_id INTEGER NOT NULL REFERENCES country_master (id),
    current_address TEXT NOT NULL,
    permanent_address TEXT NOT NULL,
    doj DATE NOT NULL,
    emp_type_id INTEGER NOT NULL REFERENCES emp_type_master (id),
    department_id INTEGER NOT NULL REFERENCES department_master (id),
    designation_id INTEGER NOT NULL REFERENCES designation_master (id),
    reporting_manager_id INTEGER REFERENCES users_master (id),
    username VARCHAR(100) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role_id INTEGER NOT NULL REFERENCES role_master (id),
    status BOOLEAN DEFAULT true,
    last_password_modified TIMESTAMP WITHOUT TIME ZONE,
    incorrect_password_attempts INTEGER DEFAULT 0,
    account_block BOOLEAN DEFAULT FALSE,
    profile_pic TEXT,
    theme VARCHAR(200) DEFAULT 'light',
    menu_type VARCHAR(200) DEFAULT 'sidebar',
    sidebar_lock BOOLEAN DEFAULT FALSE,
    created_by INTEGER references users_master (id),
    created_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by INTEGER references users_master (id),
    modified_date TIMESTAMP WITHOUT TIME ZONE,

    -- =========================
    -- Foreign Key Constraints
    -- =========================
    CONSTRAINT fk_users_nationality FOREIGN KEY (nationality_id) REFERENCES country_master (id),
    CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES department_master (id),
    CONSTRAINT fk_users_designation FOREIGN KEY (designation_id) REFERENCES designation_master (id),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES role_master (id),
    CONSTRAINT fk_users_reporting_manager FOREIGN KEY (reporting_manager_id) REFERENCES users_master (id),
    CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES users_master (id),
    CONSTRAINT fk_users_modified_by FOREIGN KEY (modified_by) REFERENCES users_master (id)
);

-- =========================
-- COMMENTS FOR users_master
-- =========================
COMMENT ON TABLE users_master IS 'Unified table for employee and user account information';

-- Personal Info
COMMENT ON COLUMN users_master.id IS 'Auto-Increment ID';
COMMENT ON COLUMN users_master.first_name IS 'Employee First Name';
COMMENT ON COLUMN users_master.middle_name IS 'Employee Middle Name';
COMMENT ON COLUMN users_master.last_name IS 'Employee Last Name';
COMMENT ON COLUMN users_master.mobile IS 'Mobile Number';
COMMENT ON COLUMN users_master.email IS 'Personal Email Address';
COMMENT ON COLUMN users_master.work_email IS 'Official Work Email';
COMMENT ON COLUMN users_master.dob IS 'Date of Birth';
COMMENT ON COLUMN users_master.gender IS 'Gender';
COMMENT ON COLUMN users_master.marital_status IS 'Marital Status';
COMMENT ON COLUMN users_master.blood_group IS 'Blood Group';
COMMENT ON COLUMN users_master.nationality_id IS 'Reference to Nationality Master';
COMMENT ON COLUMN users_master.current_address IS 'Current Residential Address';
COMMENT ON COLUMN users_master.permanent_address IS 'Permanent Residential Address';

-- Employment Info
COMMENT ON COLUMN users_master.doj IS 'Date of Joining';
COMMENT ON COLUMN users_master.emp_type IS 'Type of Employment (e.g., Permanent, Contract)';
COMMENT ON COLUMN users_master.department_id IS 'Reference to Department Master';
COMMENT ON COLUMN users_master.designation_id IS 'Reference to Designation Master';
COMMENT ON COLUMN users_master.reporting_manager_id IS 'Reporting Manager (User ID)';

-- Account Info
COMMENT ON COLUMN users_master.username IS 'System Login Username';
COMMENT ON COLUMN users_master.password IS 'Encrypted Password';
COMMENT ON COLUMN users_master.role_id IS 'Reference to Role Master';
COMMENT ON COLUMN users_master.status IS 'Account Status (TRUE = Active)';
COMMENT ON COLUMN users_master.last_password_modified IS 'Last Password Modified Timestamp';
COMMENT ON COLUMN users_master.incorrect_password_attempts IS 'Number of Failed Login Attempts';
COMMENT ON COLUMN users_master.account_block IS 'Account Block Status after Failed Attempts';
COMMENT ON COLUMN users_master.profile_pic IS 'Profile Picture URL or Path';
COMMENT ON COLUMN users_master.theme IS 'User Interface Theme';
COMMENT ON COLUMN users_master.menu_type IS 'Menu Layout Preference';
COMMENT ON COLUMN users_master.sidebar_lock IS 'Sidebar Lock Status';

-- Audit Info
COMMENT ON COLUMN users_master.created_by IS 'Created By (User ID)';
COMMENT ON COLUMN users_master.created_date IS 'Record Creation Date';
COMMENT ON COLUMN users_master.modified_by IS 'Modified By (User ID)';
COMMENT ON COLUMN users_master.modified_date IS 'Record Last Modified Date';

-- =========================
-- Indexes for Performance
-- =========================
CREATE INDEX IF NOT EXISTS idx_users_master_nationality_id ON users_master (nationality_id);
CREATE INDEX IF NOT EXISTS idx_users_master_department_id ON users_master (department_id);
CREATE INDEX IF NOT EXISTS idx_users_master_designation_id ON users_master (designation_id);
CREATE INDEX IF NOT EXISTS idx_users_master_role_id ON users_master (role_id);
CREATE INDEX IF NOT EXISTS idx_users_master_reporting_manager_id ON users_master (reporting_manager_id);
CREATE INDEX IF NOT EXISTS idx_users_master_created_by ON users_master (created_by);
CREATE INDEX IF NOT EXISTS idx_users_master_modified_by ON users_master (modified_by);

-- =============================
-- EMERGENCY CONTACTS TABLE
-- =============================
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id SERIAL PRIMARY KEY,
    
    -- Link to user/employee
    user_id INTEGER NOT NULL REFERENCES users_master(id) ON DELETE CASCADE,
    
    -- Emergency contact details
    contact_name VARCHAR(150) NOT NULL,             -- Contact Name
    relation_id INTEGER NOT NULL REFERENCES relation_master(id),  -- Relation type
    emergency_mobile VARCHAR(20) NOT NULL         -- Emergency Mobile
);

-- =============================
-- COMMENTS
-- =============================
COMMENT ON TABLE emergency_contacts IS 'Stores emergency contact details for users/employees with audit info';
COMMENT ON COLUMN emergency_contacts.id IS 'Primary Key';
COMMENT ON COLUMN emergency_contacts.user_id IS 'Reference to users_master table';
COMMENT ON COLUMN emergency_contacts.contact_name IS 'Emergency Contact Name (Required)';
COMMENT ON COLUMN emergency_contacts.relation_id IS 'Reference to relation_master (Required)';
COMMENT ON COLUMN emergency_contacts.emergency_mobile IS 'Emergency Contact Mobile Number (Required)';

-- =============================
-- Optional: Index for performance
-- =============================
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_relation_id ON emergency_contacts(relation_id);


BEGIN;

-- ==========================================
-- Table: bank_master
-- ==========================================
CREATE TABLE public.bank_master (
    id        BIGSERIAL PRIMARY KEY,             -- Primary key
    bank_name      TEXT NOT NULL UNIQUE,              -- Bank name must be unique
    status         DOUBLE PRECISION DEFAULT 1,       -- 1 = active, 0 = inactive
    is_deleted     BOOLEAN DEFAULT FALSE NOT NULL,    -- Soft delete flag
    deleted_by     INTEGER REFERENCES users_master(id),
    deleted_date   TIMESTAMP WITHOUT TIME ZONE,
    created_by     INTEGER REFERENCES users_master(id),
    created_date   TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by    INTEGER REFERENCES users_master(id),
    modified_date  TIMESTAMP WITHOUT TIME ZONE
);

-- ==========================================
-- Trigger function: auto-update modified_date
-- ==========================================
CREATE OR REPLACE FUNCTION public.trg_set_modified_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.modified_date := now();
  RETURN NEW;
END;
$$;

-- ==========================================
-- Trigger: before update on bank_master
-- ==========================================
CREATE TRIGGER trg_bank_master_set_modified_date
BEFORE UPDATE ON public.bank_master
FOR EACH ROW
EXECUTE FUNCTION public.trg_set_modified_timestamp();

-- ==========================================
-- Comments for clarity
-- ==========================================
COMMENT ON TABLE public.bank_master IS 'Master table for storing bank names with audit columns';
COMMENT ON COLUMN public.bank_master.id IS 'Primary key';
COMMENT ON COLUMN public.bank_master.bank_name IS 'Name of the bank (unique)';
COMMENT ON COLUMN public.bank_master.status IS 'Status: 1 active, 0 inactive';
COMMENT ON COLUMN public.bank_master.is_deleted IS 'Soft delete flag';
COMMENT ON COLUMN public.bank_master.created_by IS 'User ID who created the record';
COMMENT ON COLUMN public.bank_master.created_date IS 'Creation timestamp';
COMMENT ON COLUMN public.bank_master.modified_by IS 'User ID who last updated';
COMMENT ON COLUMN public.bank_master.modified_date IS 'Last update timestamp';
COMMENT ON COLUMN public.bank_master.deleted_by IS 'User ID who deleted';
COMMENT ON COLUMN public.bank_master.deleted_date IS 'Deletion timestamp';

COMMIT;

-- ==========================================
-- Insert Data (Foreign Banks)
-- ==========================================
INSERT INTO public.bank_master (bank_name, created_by) VALUES
('AB Bank Ltd.', 1),
('Abu Dhabi Commercial Bank Ltd.', 1),
('American Express Banking Corporation', 1),
('Australia and New Zealand Banking Group Ltd.', 1),
('Barclays Bank Plc.', 1),
('Bank of America', 1),
('Bank of Bahrain & Kuwait BSC', 1),
('Bank of Ceylon', 1),
('Bank of China', 1),
('Bank of Nova Scotia', 1),
('BNP Paribas', 1),
('Citibank N.A.', 1),
('Cooperatieve Rabobank U.A.', 1),
('Credit Agricole Corporate & Investment Bank', 1),
('Credit Suisse A.G.', 1),
('CTBC Bank Co., Ltd.', 1),
('DBS Bank India Limited', 1),
('Deutsche Bank', 1),
('Doha Bank Q.P.S.C', 1),
('Emirates NBD', 1),
('First Abu Dhabi Bank PJSC', 1),
('FirstRand Bank Ltd.', 1),
('HSBC Ltd', 1),
('Industrial & Commercial Bank of China Ltd.', 1),
('Industrial Bank of Korea', 1),
('J.P. Morgan Chase Bank N.A.', 1),
('JSC VTB Bank', 1),
('KEB Hana Bank', 1),
('Kookmin Bank', 1),
('Krung Thai Bank Public Co. Ltd.', 1),
('Mashreq Bank PSC', 1),
('Mizuho Bank Ltd.', 1),
('MUFG Bank, Ltd.', 1),
('NatWest Markets Plc', 1),
('Qatar National Bank (Q.P.S.C.)', 1),
('Sberbank', 1),
('SBM Bank (India) Limited', 1),
('Shinhan Bank', 1),
('Societe Generale', 1),
('Sonali Bank PLC', 1),
('Standard Chartered Bank', 1),
('Sumitomo Mitsui Banking Corporation', 1),
('United Overseas Bank Ltd', 1),
('Woori Bank', 1),
('State Bank of India', 1),
('Bank of Baroda', 1),
('Punjab National Bank', 1),
('Bank of India', 1),
('Canara Bank', 1),
('Union Bank of India', 1),
('Bank of Maharashtra', 1),
('Central Bank of India', 1),
('Indian Bank', 1),
('Indian Overseas Bank', 1),
('UCO Bank', 1),
('Punjab & Sind Bank', 1),
('Kotak Mahindra Bank', 1),
('IndusInd Bank', 1),
('IDFC First Bank', 1),
('Federal Bank', 1),
('Axis Bank Ltd.', 1),
('Bandhan Bank Ltd.', 1),
('CSB Bank Ltd.', 1),
('City Union Bank Ltd.', 1),
('DCB Bank Ltd.', 1),
('Dhanlaxmi Bank Ltd.', 1),
('Federal Bank Ltd.', 1),
('HDFC Bank Ltd.', 1),
('ICICI Bank Ltd.', 1),
('IndusInd Bank Ltd.', 1),
('IDFC First Bank Ltd.', 1),
('Jammu & Kashmir Bank Ltd.', 1),
('Karnataka Bank Ltd.', 1),
('Karur Vysya Bank Ltd.', 1),
('Kotak Mahindra Bank Ltd.', 1),
('Nainital Bank Ltd.', 1),
('RBL Bank Ltd.', 1),
('South Indian Bank Ltd.', 1),
('Tamilnad Mercantile Bank Ltd.', 1),
('YES Bank Ltd.', 1),
('IDBI Bank Ltd.', 1)
ON CONFLICT (bank_name) DO NOTHING;


COMMIT;

CREATE TABLE users_salary_details (
    id SERIAL PRIMARY KEY,                                      -- Unique ID for each record
    user_id INTEGER NOT NULL REFERENCES users_master(id),                  -- Employee/User reference
    basic_salary DECIMAL(10,2) DEFAULT 0,                       -- Basic salary
    hra DECIMAL(10,2) DEFAULT 0,                                -- House Rent Allowance
    conveyance DECIMAL(10,2) DEFAULT 0,                         -- Conveyance allowance
    medical_allowance DECIMAL(10,2) DEFAULT 0,                  -- Medical allowance
    special_allowance DECIMAL(10,2) DEFAULT 0,                  -- Special allowance
    bonus DECIMAL(10,2) DEFAULT 0,                              -- Bonus amount
    pf_employer DECIMAL(10,2) DEFAULT 0,                        -- Employer PF contribution
    pf_employee DECIMAL(10,2) DEFAULT 0,                        -- Employee PF contribution
    esi_employer DECIMAL(10,2) DEFAULT 0,                       -- Employer ESI contribution
    esi_employee DECIMAL(10,2) DEFAULT 0,                       -- Employee ESI contribution
    professional_tax DECIMAL(10,2) DEFAULT 0,                   -- Professional tax
    other_deduction DECIMAL(10,2) DEFAULT 0,                    -- Other deductions
    gross_salary DECIMAL(10,2) DEFAULT 0,                       -- Gross salary
    net_salary DECIMAL(10,2) DEFAULT 0,                         -- Net salary
    created_by INTEGER NOT NULL REFERENCES users_master(id),                                              -- User ID who created this record
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,              -- Record creation timestamp
    updated_by INTEGER REFERENCES users_master(id),                                              -- User ID who last updated this record
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,              -- Last update timestamp
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_users_salary_details_user FOREIGN KEY (user_id) REFERENCES users_master(id) ON DELETE CASCADE
);

-- Add useful indexes
CREATE INDEX idx_users_salary_details_user_id ON users_salary_details(user_id);
CREATE INDEX idx_users_salary_details_is_active ON users_salary_details(is_active);
CREATE INDEX idx_users_salary_details_created_at ON users_salary_details(created_date);

COMMENT ON TABLE users_salary_details IS 'Stores employee salary structure and payroll details.';

COMMENT ON COLUMN users_salary_details.id IS 'Primary key identifier for the salary record.';
COMMENT ON COLUMN users_salary_details.user_id IS 'Foreign key reference to the users table.';
COMMENT ON COLUMN users_salary_details.basic_salary IS 'Base salary before allowances and deductions.';
COMMENT ON COLUMN users_salary_details.hra IS 'House Rent Allowance (HRA) portion of the salary.';
COMMENT ON COLUMN users_salary_details.conveyance IS 'Conveyance or transport allowance.';
COMMENT ON COLUMN users_salary_details.medical_allowance IS 'Medical allowance component.';
COMMENT ON COLUMN users_salary_details.special_allowance IS 'Special allowance component.';
COMMENT ON COLUMN users_salary_details.bonus IS 'Bonus amount paid to the employee.';
COMMENT ON COLUMN users_salary_details.pf_employer IS 'Employer contribution to Provident Fund.';
COMMENT ON COLUMN users_salary_details.pf_employee IS 'Employee contribution to Provident Fund.';
COMMENT ON COLUMN users_salary_details.esi_employer IS 'Employer contribution to Employee State Insurance.';
COMMENT ON COLUMN users_salary_details.esi_employee IS 'Employee contribution to Employee State Insurance.';
COMMENT ON COLUMN users_salary_details.professional_tax IS 'Professional tax deducted as per state law.';
COMMENT ON COLUMN users_salary_details.other_deduction IS 'Any other miscellaneous deductions.';
COMMENT ON COLUMN users_salary_details.gross_salary IS 'Total gross salary before deductions.';
COMMENT ON COLUMN users_salary_details.net_salary IS 'Final salary payable to employee after all deductions.';
COMMENT ON COLUMN users_salary_details.created_by IS 'User ID who created this record.';
COMMENT ON COLUMN users_salary_details.created_date IS 'Timestamp when the record was created.';
COMMENT ON COLUMN users_salary_details.updated_by IS 'User ID who last updated this record.';
COMMENT ON COLUMN users_salary_details.updated_date IS 'Timestamp of last update.';
COMMENT ON COLUMN users_salary_details.is_active IS 'Indicates whether this salary record is active.';


CREATE TABLE users_bank_details (
    id SERIAL PRIMARY KEY,                             -- Unique record ID
    user_id INTEGER NOT NULL REFERENCES users_master(id),        -- Employee/User reference
    bank_id INTEGER NOT NULL REFERENCES bank_master(id),         -- Reference to master bank table
    account_number VARCHAR(50) NOT NULL,                         -- Employee bank account number
    ifsc_code VARCHAR(20) NOT NULL,                              -- IFSC code for the bank branch

    -- Audit columns
    created_by INTEGER NOT NULL REFERENCES users_master(id),      -- User who created this record
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- Record creation timestamp
    updated_by INTEGER REFERENCES users_master(id),               -- User who last updated this record
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- Record last updated timestamp
    is_active BOOLEAN DEFAULT TRUE,                               -- Status flag for active/inactive record

    comment TEXT,                                                 -- Additional notes or remarks

    CONSTRAINT fk_employee_bank_user FOREIGN KEY (user_id) REFERENCES users_master(id) ON DELETE CASCADE,
    CONSTRAINT fk_employee_bank_master FOREIGN KEY (bank_id) REFERENCES bank_master(id) ON DELETE RESTRICT
);

-- 🔍 Indexes for faster lookups
CREATE INDEX idx_employee_bank_user_id ON users_bank_details(user_id);
CREATE INDEX idx_employee_bank_bank_id ON users_bank_details(bank_id);
CREATE INDEX idx_employee_bank_is_active ON users_bank_details(is_active);
CREATE INDEX idx_employee_bank_created_date ON users_bank_details(created_date);

-- 🗒️ Comments for documentation
COMMENT ON TABLE users_bank_details IS 'Stores employee bank account details for salary disbursement.';

COMMENT ON COLUMN users_bank_details.id IS 'Primary key identifier for each bank detail record.';
COMMENT ON COLUMN users_bank_details.user_id IS 'Foreign key reference to users_master table.';
COMMENT ON COLUMN users_bank_details.bank_id IS 'Foreign key reference to bank_master table.';
COMMENT ON COLUMN users_bank_details.account_number IS 'Employee’s bank account number used for salary deposits.';
COMMENT ON COLUMN users_bank_details.ifsc_code IS 'IFSC code identifying the bank branch.';
COMMENT ON COLUMN users_bank_details.created_by IS 'User ID who created the record.';
COMMENT ON COLUMN users_bank_details.created_date IS 'Timestamp when record was created.';
COMMENT ON COLUMN users_bank_details.updated_by IS 'User ID who last updated the record.';
COMMENT ON COLUMN users_bank_details.updated_date IS 'Timestamp when record was last updated.';
COMMENT ON COLUMN users_bank_details.is_active IS 'Indicates if this bank record is active (TRUE) or inactive (FALSE).';
COMMENT ON COLUMN users_bank_details.comment IS 'Optional remarks or additional notes related to the bank account.';

-- =============================


CREATE TABLE public.cable_category_master (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    status BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users_master (id),
    created_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users_master (id),
    modified_date TIMESTAMP WITHOUT TIME ZONE
);

INSERT INTO public.cable_category_master
(category_name, created_by, created_date)
VALUES
('Electrical Wires', 1, NOW()),
('Power Cables', 1, NOW()),
('Communication Cables', 1, NOW()),
('Control & Instrumentation', 1, NOW()),
('Specialty Cables', 1, NOW());


CREATE TABLE public.cable_types_master (
    id SERIAL PRIMARY KEY,
    cable_category_id INTEGER REFERENCES public.cable_category_master (id),
    type_name VARCHAR(150),         -- e.g. Building Wires, LAN Cable, Coaxial Cable
    description TEXT,
    status BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users_master (id),
	created_date TIMESTAMP WITHOUT TIME ZONE,
    modified_by INTEGER REFERENCES users_master (id),
    modified_date TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX idx_cable_types_category ON public.cable_types_master(category);
CREATE INDEX idx_cable_types_type_name ON public.cable_types_master(type_name);
CREATE INDEX idx_cable_types_conductor_material ON public.cable_types_master(conductor_material);
CREATE INDEX idx_cable_types_insulation_material ON public.cable_types_master(insulation_material);
CREATE INDEX idx_cable_types_voltage_rating ON public.cable_types_master(voltage_rating);
CREATE INDEX idx_cable_types_status ON public.cable_types_master(status);

CREATE TABLE public.cable_stage_master (
    id SERIAL PRIMARY KEY,
    wire_cable_type_id INTEGER REFERENCES wire_cable_types_master(id),
    stage_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    comment TEXT,
    status BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP WITHOUT TIME ZONE
);

-- Comments on table and columns
COMMENT ON TABLE public.cable_stage_master IS 'Master table storing all production stages used in LAN cable manufacturing';

COMMENT ON COLUMN public.cable_stage_master.id IS 'Unique identifier for each production stage';
COMMENT ON COLUMN public.cable_stage_master.wire_cable_type_id IS 'Reference to wire/cable type from wire_cable_types_master';
COMMENT ON COLUMN public.cable_stage_master.stage_name IS 'Name of the cable production stage (e.g., Conductor, Insulation, Pairing)';
COMMENT ON COLUMN public.cable_stage_master.description IS 'Detailed explanation of what happens during this stage';
COMMENT ON COLUMN public.cable_stage_master.comment IS 'Additional notes or guidelines for this stage';
COMMENT ON COLUMN public.cable_stage_master.status IS 'Indicates if the stage is active (true) or inactive (false)';
COMMENT ON COLUMN public.cable_stage_master.created_by IS 'User ID who created this record';
COMMENT ON COLUMN public.cable_stage_master.created_date IS 'Timestamp when the record was created';
COMMENT ON COLUMN public.cable_stage_master.modified_by IS 'User ID who last modified this record';
COMMENT ON COLUMN public.cable_stage_master.modified_date IS 'Timestamp when the record was last modified';


-- Insert all stages
INSERT INTO public.cable_stage_master (wire_cable_type_id, stage_name, description, created_by)
VALUES
(1, 'Conductor Information', 'Base copper wire preparation', 1),
(1, 'Insulation Information', 'Applying insulation on individual copper conductors', 1),
(1, 'Pairing Information', 'Twisting two insulated conductors into pairs', 1),
(1, 'Stranding Information', 'Stranding multiple pairs together to form a core', 1),
(1, 'Armoring Information', 'Adding a protective metal armor layer (optional, for outdoor cables)', 1),
(1, 'Sheathing Information', 'Applying outer protective sheath', 1);

CREATE TABLE public.unit_type_master (
    id BIGSERIAL PRIMARY KEY,
    uom_code VARCHAR(20) NOT NULL UNIQUE,
    uom_name VARCHAR(100) NOT NULL,
    unit_type VARCHAR(255),
    status DOUBLE PRECISION DEFAULT 0,
    is_deleted DOUBLE PRECISION DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP WITHOUT TIME ZONE,
    approved_by INTEGER REFERENCES users_master(id),
    approved_date TIMESTAMP WITHOUT TIME ZONE,
    deleted_by INTEGER REFERENCES users_master(id),
    deleted_date TIMESTAMP WITHOUT TIME ZONE
);

-- Comments
COMMENT ON TABLE public.unit_type_master IS 'Master table to store types of measurement units used in the system';

COMMENT ON COLUMN public.unit_type_master.id IS 'Unique identifier for each unit type record';
COMMENT ON COLUMN public.unit_type_master.uom_code IS 'Short code for the unit of measure (e.g., KG, M, PCS)';
COMMENT ON COLUMN public.unit_type_master.uom_name IS 'Full name of the unit of measure (e.g., Kilogram, Meter, Pieces)';
COMMENT ON COLUMN public.unit_type_master.unit_type IS 'Type or category of the unit (e.g., Weight, Length, Count)';
COMMENT ON COLUMN public.unit_type_master.status IS 'Status of the record (0 = inactive, 1 = active)';
COMMENT ON COLUMN public.unit_type_master.is_deleted IS 'Logical deletion flag (0 = not deleted, 1 = deleted)';
COMMENT ON COLUMN public.unit_type_master.created_by IS 'User ID who created this record';
COMMENT ON COLUMN public.unit_type_master.created_date IS 'Timestamp when the record was created';
COMMENT ON COLUMN public.unit_type_master.modified_by IS 'User ID who last modified this record';
COMMENT ON COLUMN public.unit_type_master.modified_date IS 'Timestamp when the record was last modified';
COMMENT ON COLUMN public.unit_type_master.approved_by IS 'User ID who approved this record';
COMMENT ON COLUMN public.unit_type_master.approved_date IS 'Timestamp when this record was approved';
COMMENT ON COLUMN public.unit_type_master.deleted_by IS 'User ID who deleted this record';
COMMENT ON COLUMN public.unit_type_master.deleted_date IS 'Timestamp when this record was deleted';

INSERT INTO public.unit_type_master 
(uom_code, uom_name, unit_type, status, is_deleted, created_by, created_date)
VALUES
('KG','Kilogram','Weight', 1, 0, 1, NOW()),
('G','Gram','Weight', 1, 0, 1, NOW()),
('MG','Milligram','Weight', 1, 0, 1, NOW()),
('M','Meter','Length', 1, 0, 1, NOW()),
('CM','Centimeter','Length', 1, 0, 1, NOW()),
('MM','Millimeter','Length', 1, 0, 1, NOW()),
('PCS','Pieces','Count', 1, 0, 1, NOW()),
('NOS','Numbers','Count', 1, 0, 1, NOW()),
('SET','Set','Count', 1, 0, 1, NOW()),
('LTR','Litre','Volume', 1, 0, 1, NOW()),
('ML','Millilitre','Volume', 1, 0, 1, NOW()),
('ROLL','Roll','Packaging', 1, 0, 1, NOW()),
('COIL','Coil','Packaging', 1, 0, 1, NOW()),
('BOX','Box','Packaging', 1, 0, 1, NOW()),
('MTR','Meter (Cable Length)', 'Length', 1, 0, 1, NOW());

CREATE TABLE public.material_master (
    id SERIAL PRIMARY KEY,
    material_name VARCHAR(100) NOT NULL,
    cable_stage_id INTEGER not null REFERENCES cable_stage_master(id),
    description TEXT,
    uom_id INTEGER not null REFERENCES unit_type_master(id),
    status DOUBLE PRECISION DEFAULT 0,  -- 1 = inactive, 0 = active
    created_by INTEGER not null REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP WITHOUT TIME ZONE
);

COMMENT ON TABLE public.material_master IS 'Master table storing all raw materials used in cable manufacturing';
COMMENT ON COLUMN public.material_master.id IS 'Unique ID for each material';
COMMENT ON COLUMN public.material_master.material_name IS 'Name of the material (e.g. Copper, PVC, PE, Steel Tape)';
COMMENT ON COLUMN public.material_master.cable_stage_id IS 'Category of the material (e.g. Conductor, Insulation, Armor, Sheath, Filler, Wrapping)';
COMMENT ON COLUMN public.material_master.description IS 'Details about the material properties or usage';
COMMENT ON COLUMN public.material_master.uom_id IS 'Measurement unit (e.g. kg, meter, roll, piece)';
COMMENT ON COLUMN public.material_master.status IS 'Indicates if the material is active (0) or inactive (1)';
COMMENT ON COLUMN public.material_master.created_by IS 'User ID who created this record';
COMMENT ON COLUMN public.material_master.created_date IS 'Timestamp when this record was created';
COMMENT ON COLUMN public.material_master.modified_by IS 'User ID who last modified this record';
COMMENT ON COLUMN public.material_master.modified_date IS 'Timestamp when this record was last modified';


CREATE TABLE public.production_datasheet (
    id BIGSERIAL PRIMARY KEY,
    datasheet_name VARCHAR(200) NOT NULL, -- New column
    org_id INTEGER NOT NULL REFERENCES organizations_master(id),
    cable_category_id INTEGER NOT NULL REFERENCES cable_category_master(id),
    wire_cable_type_id INTEGER NOT NULL REFERENCES wire_cable_types_master(id),
    description TEXT,
    status DOUBLE PRECISION DEFAULT 0,
    is_deleted DOUBLE PRECISION DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP WITHOUT TIME ZONE,
    approved_by INTEGER REFERENCES users_master(id),
    approved_date TIMESTAMP WITHOUT TIME ZONE,
    deleted_by INTEGER REFERENCES users_master(id),
    deleted_date TIMESTAMP WITHOUT TIME ZONE
);

-- Indexes for faster joins and lookups
CREATE INDEX idx_production_org_id ON production_datasheet(org_id);
CREATE INDEX idx_production_cable_category_id ON production_datasheet(cable_category_id);
CREATE INDEX idx_production_wire_cable_type_id ON production_datasheet(wire_cable_type_id);
CREATE INDEX idx_production_status ON production_datasheet(status);
CREATE INDEX idx_production_is_deleted ON production_datasheet(is_deleted);


-- Comments
COMMENT ON TABLE public.production_datasheet IS 'Main datasheet to store production details for standalone cable manufacturing';
COMMENT ON COLUMN public.production_datasheet.id IS 'Unique identifier for each datasheet record';
COMMENT ON COLUMN public.production_datasheet.datasheet_name IS 'Name or title to identify this datasheet';
COMMENT ON COLUMN public.production_datasheet.org_id IS 'Reference to the organization that owns this datasheet';
COMMENT ON COLUMN public.production_datasheet.cable_category_id IS 'Reference to the cable category (e.g. communication, power)';
COMMENT ON COLUMN public.production_datasheet.wire_cable_type_id IS 'Reference to the specific wire/cable type (e.g. LAN, power cable)';
COMMENT ON COLUMN public.production_datasheet.status IS 'Status flag to indicate current state (0 = Draft, 1 = Active, 2 = Inactive, etc.)';
COMMENT ON COLUMN public.production_datasheet.is_deleted IS 'Soft delete flag (0 = Active, 1 = Deleted)';
COMMENT ON COLUMN public.production_datasheet.created_by IS 'User ID who created this record';
COMMENT ON COLUMN public.production_datasheet.created_date IS 'Timestamp when this record was created';
COMMENT ON COLUMN public.production_datasheet.modified_by IS 'User ID who last modified this record';
COMMENT ON COLUMN public.production_datasheet.modified_date IS 'Timestamp when the record was last modified';
COMMENT ON COLUMN public.production_datasheet.approved_by IS 'User ID who approved this datasheet';
COMMENT ON COLUMN public.production_datasheet.approved_date IS 'Timestamp when this datasheet was approved';
COMMENT ON COLUMN public.production_datasheet.deleted_by IS 'User ID who soft-deleted this record';
COMMENT ON COLUMN public.production_datasheet.deleted_date IS 'Timestamp when this record was soft-deleted';

-- =============================
-- CONDUCTOR INFORMATION TABLE
-- =============================
CREATE TABLE public.conductor_information (
    id BIGSERIAL PRIMARY KEY,
    conductor_material_id INTEGER REFERENCES material_master(id),
    pd_id INTEGER NOT NULL REFERENCES production_datasheet(id),
    no_of_cores NUMERIC(10,3) NOT NULL,
    strands_per_core NUMERIC(10,3) NOT NULL,
    size_per_strands NUMERIC(10,3) NOT NULL,
    elongation NUMERIC(5,2) NOT NULL CHECK (elongation <= 100),
    resistance NUMERIC(10,3) NOT NULL,
    wire_size_tolerance NUMERIC(10,3) NOT NULL,
    lay_length NUMERIC(10,3) NOT NULL,
    comments TEXT,
    status DOUBLE PRECISION DEFAULT 0,
    is_deleted DOUBLE PRECISION DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP WITHOUT TIME ZONE,
    approved_by INTEGER REFERENCES users_master(id),
    approved_date TIMESTAMP WITHOUT TIME ZONE,
    deleted_by INTEGER REFERENCES users_master(id),
    deleted_date TIMESTAMP WITHOUT TIME ZONE
);

-- Comments
COMMENT ON TABLE public.conductor_information IS 'Stores conductor-related specifications';
COMMENT ON COLUMN public.conductor_information.conductor_material_id IS 'Reference to material used for conductor';
COMMENT ON COLUMN public.conductor_information.no_of_cores IS 'Number of cores used';
COMMENT ON COLUMN public.conductor_information.strands_per_core IS 'Strands per core';
COMMENT ON COLUMN public.conductor_information.size_per_strands IS 'Size of each strand';
COMMENT ON COLUMN public.conductor_information.elongation IS 'Elongation percentage (max 100)';
COMMENT ON COLUMN public.conductor_information.resistance IS 'Electrical resistance of the conductor';
COMMENT ON COLUMN public.conductor_information.wire_size_tolerance IS 'Allowed size tolerance for wire';
COMMENT ON COLUMN public.conductor_information.lay_length IS 'Lay length of conductor';
COMMENT ON COLUMN public.conductor_information.comments IS 'Additional notes or comments';

-- Indexes
CREATE INDEX idx_conductor_status ON conductor_information(status);
CREATE INDEX idx_conductor_is_deleted ON conductor_information(is_deleted);
CREATE INDEX idx_conductor_created_by ON conductor_information(created_by);

-- =============================
-- INSULATION INFORMATION TABLE
-- =============================
CREATE TABLE public.insulation_information (
    id BIGSERIAL PRIMARY KEY,
    pd_id INTEGER NOT NULL REFERENCES production_datasheet(id),
    insulation_material_id INTEGER NOT NULL REFERENCES material_master(id),
    color VARCHAR(100) NOT NULL,
    thichkess_nom NUMERIC(10,3) NOT NULL,
    insulation_tolerance NUMERIC(10,3) NOT NULL,
    overall_dia NUMERIC(10,3) NOT NULL,
    dia_tolerance NUMERIC(10,3) NOT NULL,
    master_batch NUMERIC(5,2) NOT NULL CHECK (master_batch <= 100),
    spark_test NUMERIC(10,3) NOT NULL,
    comments TEXT,
    status DOUBLE PRECISION DEFAULT 0,
    is_deleted DOUBLE PRECISION DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP WITHOUT TIME ZONE,
    approved_by INTEGER REFERENCES users_master(id),
    approved_date TIMESTAMP WITHOUT TIME ZONE,
    deleted_by INTEGER REFERENCES users_master(id),
    deleted_date TIMESTAMP WITHOUT TIME ZONE
);

COMMENT ON TABLE public.insulation_information IS 'Stores insulation-related specifications';
COMMENT ON COLUMN public.insulation_information.insulation_material_id IS 'Reference to insulation material used';
COMMENT ON COLUMN public.insulation_information.color IS 'Color of insulation material';
COMMENT ON COLUMN public.insulation_information.thichkess_nom IS 'Nominal thickness of insulation';
COMMENT ON COLUMN public.insulation_information.insulation_tolerance IS 'Allowed insulation thickness tolerance';
COMMENT ON COLUMN public.insulation_information.overall_dia IS 'Overall diameter after insulation';
COMMENT ON COLUMN public.insulation_information.dia_tolerance IS 'Allowed diameter tolerance';
COMMENT ON COLUMN public.insulation_information.master_batch IS 'Master batch percentage (max 100)';
COMMENT ON COLUMN public.insulation_information.spark_test IS 'Spark test voltage';
COMMENT ON COLUMN public.insulation_information.comments IS 'Additional notes or comments';

CREATE INDEX idx_insulation_status ON insulation_information(status);
CREATE INDEX idx_insulation_is_deleted ON insulation_information(is_deleted);
CREATE INDEX idx_insulation_created_by ON insulation_information(created_by);

-- =============================
-- PAIRING INFORMATION TABLE
-- =============================
CREATE TABLE public.pairing_information (
    id BIGSERIAL PRIMARY KEY,
    pd_id INTEGER NOT NULL REFERENCES production_datasheet(id),
    pairing_color VARCHAR(100) NOT NULL,
    pairing_lay NUMERIC(10,3) NOT NULL,
    pairing_lay_tolerance NUMERIC(10,3) NOT NULL,
    back_twist NUMERIC(5,2) NOT NULL CHECK (back_twist <= 100),
    comments TEXT,
    status DOUBLE PRECISION DEFAULT 0,
    is_deleted DOUBLE PRECISION DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP WITHOUT TIME ZONE,
    approved_by INTEGER REFERENCES users_master(id),
    approved_date TIMESTAMP WITHOUT TIME ZONE,
    deleted_by INTEGER REFERENCES users_master(id),
    deleted_date TIMESTAMP WITHOUT TIME ZONE
);

COMMENT ON TABLE public.pairing_information IS 'Stores pairing-related specifications';
COMMENT ON COLUMN public.pairing_information.pairing_color IS 'Color scheme of the pair';
COMMENT ON COLUMN public.pairing_information.pairing_lay IS 'Lay length of the pair';
COMMENT ON COLUMN public.pairing_information.pairing_lay_tolerance IS 'Allowed tolerance of lay length';
COMMENT ON COLUMN public.pairing_information.back_twist IS 'Back twist percentage (max 100)';
COMMENT ON COLUMN public.pairing_information.comments IS 'Additional notes or comments';

CREATE INDEX idx_pairing_status ON pairing_information(status);
CREATE INDEX idx_pairing_is_deleted ON pairing_information(is_deleted);
CREATE INDEX idx_pairing_created_by ON pairing_information(created_by);
-- =============================

CREATE TABLE braiding_information (
    id SERIAL PRIMARY KEY,
    pd_id INTEGER NOT NULL REFERENCES production_datasheet(id),
    polyester_tape TEXT NOT NULL,
    almyar_tape TEXT NOT NULL,
    material_id INTEGER NOT NULL REFERENCES material_master(id),
    no_of_wires DOUBLE PRECISION NOT NULL,
    wire_size DOUBLE PRECISION NOT NULL,
    drain_wire_material_id INTEGER NOT NULL REFERENCES material_master(id),
    drain_wire_size DOUBLE PRECISION NOT NULL,
    diameter DOUBLE PRECISION NOT NULL,
    comments TEXT,
    status DOUBLE PRECISION DEFAULT 0,
    is_deleted DOUBLE PRECISION DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP WITHOUT TIME ZONE,
    approved_by INTEGER REFERENCES users_master(id),
    approved_date TIMESTAMP WITHOUT TIME ZONE,
    deleted_by INTEGER REFERENCES users_master(id),
    deleted_date TIMESTAMP WITHOUT TIME ZONE
);

COMMENT ON TABLE braiding_information IS 'Stores braiding related information for cable production.';
COMMENT ON COLUMN braiding_information.id IS 'Primary key for braiding information';
COMMENT ON COLUMN braiding_information.pd_id IS 'Reference to the related sales order item';
COMMENT ON COLUMN braiding_information.polyester_tape IS 'Type of polyester tape used';
COMMENT ON COLUMN braiding_information.almyar_tape IS 'Type of almyar tape used';
COMMENT ON COLUMN braiding_information.material_id IS 'Material used for braiding';
COMMENT ON COLUMN braiding_information.no_of_wires IS 'Number of wires used in braiding';
COMMENT ON COLUMN braiding_information.wire_size IS 'Size of each wire used in braiding';
COMMENT ON COLUMN braiding_information.drain_wire_material_id IS 'Material used for drain wire';
COMMENT ON COLUMN braiding_information.drain_wire_size IS 'Size of the drain wire';
COMMENT ON COLUMN braiding_information.diameter IS 'Diameter after braiding stage';
COMMENT ON COLUMN braiding_information.comments IS 'Additional notes or remarks';
COMMENT ON COLUMN braiding_information.status IS 'Current status of the record';
COMMENT ON COLUMN braiding_information.is_deleted IS 'Logical delete flag (0 = active, 1 = deleted)';
COMMENT ON COLUMN braiding_information.created_by IS 'User ID who created the record';
COMMENT ON COLUMN braiding_information.created_date IS 'Timestamp when record was created';
COMMENT ON COLUMN braiding_information.modified_by IS 'User ID who last modified the record';
COMMENT ON COLUMN braiding_information.modified_date IS 'Timestamp of last modification';
COMMENT ON COLUMN braiding_information.approved_by IS 'User ID who approved the record';
COMMENT ON COLUMN braiding_information.approved_date IS 'Timestamp of approval';
COMMENT ON COLUMN braiding_information.deleted_by IS 'User ID who deleted the record';
COMMENT ON COLUMN braiding_information.deleted_date IS 'Timestamp of deletion';

CREATE INDEX idx_braiding_pd_id ON braiding_information(pd_id);
CREATE INDEX idx_braiding_material_id ON braiding_information(material_id);
CREATE INDEX idx_braiding_drain_material_id ON braiding_information(drain_wire_material_id);
CREATE INDEX idx_braiding_status ON braiding_information(status);
CREATE INDEX idx_braiding_is_deleted ON braiding_information(is_deleted);
-- =============================
CREATE TABLE armoring_information (
    id SERIAL PRIMARY KEY,
    pd_id INTEGER NOT NULL REFERENCES production_datasheet(id),
    armoring_material_id INTEGER NOT NULL REFERENCES material_master(id),
    size_of_wire_strips DOUBLE PRECISION NOT NULL,
    number_of_wire_strips DOUBLE PRECISION NOT NULL,
    diameter_over_armouring DOUBLE PRECISION NOT NULL,
    coverage DOUBLE PRECISION NOT NULL,
    comments TEXT,
    status DOUBLE PRECISION DEFAULT 0,
    is_deleted DOUBLE PRECISION DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP WITHOUT TIME ZONE,
    approved_by INTEGER REFERENCES users_master(id),
    approved_date TIMESTAMP WITHOUT TIME ZONE,
    deleted_by INTEGER REFERENCES users_master(id),
    deleted_date TIMESTAMP WITHOUT TIME ZONE
);

COMMENT ON TABLE armoring_information IS 'Stores details of the armoring layer.';
COMMENT ON COLUMN armoring_information.id IS 'Primary key for armoring information';
COMMENT ON COLUMN armoring_information.pd_id IS 'Reference to the related sales order item';
COMMENT ON COLUMN armoring_information.armoring_material_id IS 'Material used for armoring';
COMMENT ON COLUMN armoring_information.size_of_wire_strips IS 'Size of wire strips used in armoring';
COMMENT ON COLUMN armoring_information.number_of_wire_strips IS 'Number of wire strips used';
COMMENT ON COLUMN armoring_information.diameter_over_armouring IS 'Overall diameter after armoring';
COMMENT ON COLUMN armoring_information.coverage IS 'Percentage coverage of armoring layer';
COMMENT ON COLUMN armoring_information.comments IS 'Additional notes or remarks';
COMMENT ON COLUMN armoring_information.status IS 'Current status of the record';
COMMENT ON COLUMN armoring_information.is_deleted IS 'Logical delete flag';
COMMENT ON COLUMN armoring_information.created_by IS 'User who created the record';
COMMENT ON COLUMN armoring_information.created_date IS 'Record creation timestamp';
COMMENT ON COLUMN armoring_information.modified_by IS 'User who last modified the record';
COMMENT ON COLUMN armoring_information.modified_date IS 'Timestamp of last modification';
COMMENT ON COLUMN armoring_information.approved_by IS 'User who approved the record';
COMMENT ON COLUMN armoring_information.approved_date IS 'Timestamp of approval';
COMMENT ON COLUMN armoring_information.deleted_by IS 'User who deleted the record';
COMMENT ON COLUMN armoring_information.deleted_date IS 'Timestamp of deletion';

CREATE INDEX idx_armoring_pd_id ON armoring_information(pd_id);
CREATE INDEX idx_armoring_material_id ON armoring_information(armoring_material_id);
CREATE INDEX idx_armoring_status ON armoring_information(status);
CREATE INDEX idx_armoring_is_deleted ON armoring_information(is_deleted);
-- =============================
CREATE TABLE inner_sheathing_information (
    id SERIAL PRIMARY KEY,
    pd_id INTEGER NOT NULL REFERENCES production_datasheet(id),
    material_id INTEGER NOT NULL REFERENCES material_master(id),
    color TEXT NOT NULL,
    min_thickness DOUBLE PRECISION NOT NULL,
    nominal_thickness DOUBLE PRECISION NOT NULL,
    inner_diameter DOUBLE PRECISION NOT NULL,
    comments TEXT,
    status DOUBLE PRECISION DEFAULT 0,
    is_deleted DOUBLE PRECISION DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP WITHOUT TIME ZONE,
    approved_by INTEGER REFERENCES users_master(id),
    approved_date TIMESTAMP WITHOUT TIME ZONE,
    deleted_by INTEGER REFERENCES users_master(id),
    deleted_date TIMESTAMP WITHOUT TIME ZONE
);

COMMENT ON TABLE inner_sheathing_information IS 'Details of the inner sheathing layer of the cable.';
COMMENT ON COLUMN inner_sheathing_information.id IS 'Primary key';
COMMENT ON COLUMN inner_sheathing_information.pd_id IS 'Reference to the related sales order item';
COMMENT ON COLUMN inner_sheathing_information.material_id IS 'Material used for inner sheathing';
COMMENT ON COLUMN inner_sheathing_information.color IS 'Color of the inner sheath';
COMMENT ON COLUMN inner_sheathing_information.min_thickness IS 'Minimum thickness of the layer';
COMMENT ON COLUMN inner_sheathing_information.nominal_thickness IS 'Nominal thickness of the layer';
COMMENT ON COLUMN inner_sheathing_information.inner_diameter IS 'Inner diameter after sheathing';
COMMENT ON COLUMN inner_sheathing_information.comments IS 'Additional notes';
COMMENT ON COLUMN inner_sheathing_information.status IS 'Current status';
COMMENT ON COLUMN inner_sheathing_information.is_deleted IS 'Logical delete flag';
COMMENT ON COLUMN inner_sheathing_information.created_by IS 'User who created the record';
COMMENT ON COLUMN inner_sheathing_information.created_date IS 'Timestamp when created';
COMMENT ON COLUMN inner_sheathing_information.modified_by IS 'User who last modified';
COMMENT ON COLUMN inner_sheathing_information.modified_date IS 'Timestamp of modification';
COMMENT ON COLUMN inner_sheathing_information.approved_by IS 'User who approved';
COMMENT ON COLUMN inner_sheathing_information.approved_date IS 'Timestamp of approval';
COMMENT ON COLUMN inner_sheathing_information.deleted_by IS 'User who deleted';
COMMENT ON COLUMN inner_sheathing_information.deleted_date IS 'Timestamp of deletion';

CREATE INDEX idx_inner_sheathing_pd_id ON inner_sheathing_information(pd_id);
CREATE INDEX idx_inner_sheathing_material_id ON inner_sheathing_information(material_id);
CREATE INDEX idx_inner_sheathing_status ON inner_sheathing_information(status);
CREATE INDEX idx_inner_sheathing_is_deleted ON inner_sheathing_information(is_deleted);
-- =============================
CREATE TABLE outer_sheathing_information (
    id SERIAL PRIMARY KEY,
    pd_id INTEGER NOT NULL REFERENCES production_datasheet(id),
    material_id INTEGER NOT NULL REFERENCES material_master(id),
    color TEXT NOT NULL,
    min_thickness DOUBLE PRECISION NOT NULL,
    nominal_thickness DOUBLE PRECISION NOT NULL,
    master_batch_dosing DOUBLE PRECISION NOT NULL,
    outer_diameter DOUBLE PRECISION NOT NULL,
    printing_color TEXT NOT NULL,
    printing TEXT NOT NULL,
    comments TEXT,
    status DOUBLE PRECISION DEFAULT 0,
    is_deleted DOUBLE PRECISION DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP WITHOUT TIME ZONE,
    approved_by INTEGER REFERENCES users_master(id),
    approved_date TIMESTAMP WITHOUT TIME ZONE,
    deleted_by INTEGER REFERENCES users_master(id),
    deleted_date TIMESTAMP WITHOUT TIME ZONE
);

COMMENT ON TABLE outer_sheathing_information IS 'Details of the outer sheathing layer of the cable.';
COMMENT ON COLUMN outer_sheathing_information.id IS 'Primary key';
COMMENT ON COLUMN outer_sheathing_information.pd_id IS 'Reference to the related sales order item';
COMMENT ON COLUMN outer_sheathing_information.material_id IS 'Material used for outer sheathing';
COMMENT ON COLUMN outer_sheathing_information.color IS 'Color of the outer sheath';
COMMENT ON COLUMN outer_sheathing_information.min_thickness IS 'Minimum thickness';
COMMENT ON COLUMN outer_sheathing_information.nominal_thickness IS 'Nominal thickness';
COMMENT ON COLUMN outer_sheathing_information.master_batch_dosing IS 'Master batch dosing percentage';
COMMENT ON COLUMN outer_sheathing_information.outer_diameter IS 'Outer diameter after sheathing';
COMMENT ON COLUMN outer_sheathing_information.printing_color IS 'Printing color on the sheath';
COMMENT ON COLUMN outer_sheathing_information.printing IS 'Printing text or pattern';
COMMENT ON COLUMN outer_sheathing_information.comments IS 'Additional remarks';
COMMENT ON COLUMN outer_sheathing_information.status IS 'Current status';
COMMENT ON COLUMN outer_sheathing_information.is_deleted IS 'Logical delete flag';
COMMENT ON COLUMN outer_sheathing_information.created_by IS 'User who created the record';
COMMENT ON COLUMN outer_sheathing_information.created_date IS 'Timestamp of creation';
COMMENT ON COLUMN outer_sheathing_information.modified_by IS 'User who last modified';
COMMENT ON COLUMN outer_sheathing_information.modified_date IS 'Timestamp of last modification';
COMMENT ON COLUMN outer_sheathing_information.approved_by IS 'User who approved';
COMMENT ON COLUMN outer_sheathing_information.approved_date IS 'Timestamp of approval';
COMMENT ON COLUMN outer_sheathing_information.deleted_by IS 'User who deleted';
COMMENT ON COLUMN outer_sheathing_information.deleted_date IS 'Timestamp of deletion';

CREATE INDEX idx_outer_sheathing_pd_id ON outer_sheathing_information(pd_id);
CREATE INDEX idx_outer_sheathing_material_id ON outer_sheathing_information(material_id);
CREATE INDEX idx_outer_sheathing_status ON outer_sheathing_information(status);
CREATE INDEX idx_outer_sheathing_is_deleted ON outer_sheathing_information(is_deleted);
-- =============================
CREATE TABLE laid_up_information (
    id SERIAL PRIMARY KEY,
    pd_id INTEGER NOT NULL REFERENCES production_datasheet(id),
    laid_up_dia DOUBLE PRECISION NOT NULL,
    binder_tape TEXT NOT NULL,
    color_sequence TEXT NOT NULL,
    overall_dia DOUBLE PRECISION NOT NULL,
    lay_length DOUBLE PRECISION NOT NULL,
    lay_direction DOUBLE PRECISION NOT NULL,
    comments TEXT,
    status DOUBLE PRECISION DEFAULT 0,
    is_deleted DOUBLE PRECISION DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP WITHOUT TIME ZONE,
    approved_by INTEGER REFERENCES users_master(id),
    approved_date TIMESTAMP WITHOUT TIME ZONE,
    deleted_by INTEGER REFERENCES users_master(id),
    deleted_date TIMESTAMP WITHOUT TIME ZONE
);

COMMENT ON TABLE laid_up_information IS 'Stores laid-up stage information of the cable.';
COMMENT ON COLUMN laid_up_information.id IS 'Primary key';
COMMENT ON COLUMN laid_up_information.pd_id IS 'Reference to the related sales order item';
COMMENT ON COLUMN laid_up_information.laid_up_dia IS 'Diameter after laid-up stage';
COMMENT ON COLUMN laid_up_information.binder_tape IS 'Type of binder tape used';
COMMENT ON COLUMN laid_up_information.color_sequence IS 'Color sequence used in laid-up';
COMMENT ON COLUMN laid_up_information.overall_dia IS 'Overall diameter after laid-up';
COMMENT ON COLUMN laid_up_information.lay_length IS 'Lay length of the cable';
COMMENT ON COLUMN laid_up_information.lay_direction IS 'Lay direction value';
COMMENT ON COLUMN laid_up_information.comments IS 'Additional notes';
COMMENT ON COLUMN laid_up_information.status IS 'Current status';
COMMENT ON COLUMN laid_up_information.is_deleted IS 'Logical delete flag';
COMMENT ON COLUMN laid_up_information.created_by IS 'User who created the record';
COMMENT ON COLUMN laid_up_information.created_date IS 'Timestamp of creation';
COMMENT ON COLUMN laid_up_information.modified_by IS 'User who modified';
COMMENT ON COLUMN laid_up_information.modified_date IS 'Timestamp of modification';
COMMENT ON COLUMN laid_up_information.approved_by IS 'User who approved';
COMMENT ON COLUMN laid_up_information.approved_date IS 'Timestamp of approval';
COMMENT ON COLUMN laid_up_information.deleted_by IS 'User who deleted';
COMMENT ON COLUMN laid_up_information.deleted_date IS 'Timestamp of deletion';

CREATE INDEX idx_laid_up_pd_id ON laid_up_information(pd_id);
CREATE INDEX idx_laid_up_status ON laid_up_information(status);
CREATE INDEX idx_laid_up_is_deleted ON laid_up_information(is_deleted);

-- =============================


CREATE TABLE IF NOT EXISTS payment_term_master (
	id SERIAL PRIMARY KEY,
	payment_method INTEGER DEFAULT 0,
	payment_percentage_1 DOUBLE PRECISION NOT NULL DEFAULT 0,
	payment_percentage_2 DOUBLE PRECISION DEFAULT 0,
	payment_days INTEGER DEFAULT 0,
	payment_term TEXT,
	type INTEGER DEFAULT 0,
    status DOUBLE PRECISION DEFAULT 0,
    is_deleted DOUBLE PRECISION DEFAULT 0,
    created_by INTEGER REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP WITHOUT TIME ZONE,
    approved_by INTEGER REFERENCES users_master(id),
    approved_date TIMESTAMP WITHOUT TIME ZONE,
    deleted_by INTEGER REFERENCES users_master(id),
    deleted_date TIMESTAMP WITHOUT TIME ZONE
);
COMMENT ON TABLE payment_term_master IS '';
COMMENT ON COLUMN payment_term_master.id IS 'Auto-Increment ID';
COMMENT ON COLUMN payment_term_master.payment_method IS 'Payment Method (1 = TT, 2 = LC)';
COMMENT ON COLUMN payment_term_master.payment_percentage_1 IS 'Percentage 1';
COMMENT ON COLUMN payment_term_master.payment_percentage_2 IS 'Percentage 2';
COMMENT ON COLUMN payment_term_master.payment_days IS 'Days';
COMMENT ON COLUMN payment_term_master.payment_term IS 'Payment Term';
COMMENT ON COLUMN payment_term_master.type IS 'Type (1 = Sales)';
COMMENT ON COLUMN payment_term_master.status IS 'Status (0 = Inactive, 1 = Active)';
COMMENT ON COLUMN payment_term_master.is_deleted IS 'Is Deleted (0 = No, 1 = Yes)';
COMMENT ON COLUMN payment_term_master.created_by IS 'Created By User ID';
COMMENT ON COLUMN payment_term_master.created_date IS 'Created Date';
COMMENT ON COLUMN payment_term_master.modified_by IS 'Modified By User ID';
COMMENT ON COLUMN payment_term_master.modified_date IS 'Modified Date';
COMMENT ON COLUMN payment_term_master.approved_by IS 'Approved By User ID';
COMMENT ON COLUMN payment_term_master.approved_date IS 'Approved Date';
COMMENT ON COLUMN payment_term_master.deleted_by IS 'Deleted By User ID';
COMMENT ON COLUMN payment_term_master.deleted_date IS 'Deleted Date';

INSERT INTO payment_term_master (payment_method, payment_percentage_1, payment_percentage_2, payment_days, payment_term, type, status, created_by) VALUES 
(1, 100, 0, 0, '100% Advance TT', 1, 1, 1),
(1, 15, 85, 10, '15% Advance TT Payment & 85% Against Draft Shipping Documents Within 10 Days From BL Date', 1, 1, 1),
(1, 20, 80, 10, '20% Advance TT Payment & 80% Against Draft Shipping Documents Within 10 Days From BL Date', 1, 1, 1),
(1, 25, 75, 10, '25% Advance TT Payment & 75% Against Draft Shipping Documents Within 10 Days From BL Date', 1, 1, 1),
(1, 30, 70, 10, '30% Advance TT Payment & 70% Against Draft Shipping Documents Within 10 Days From BL Date', 1, 1, 1),
(2, 0, 0, 0, 'LC At Sight', 1, 1, 1),
(2, 0, 0, 90, 'LC At 90 Days From BL Date', 1, 1, 1),
(2, 0, 0, 120, 'LC At 120 Days From BL Date', 1, 1, 1),
(2, 0, 0, 180, 'LC At 180 Days From BL Date', 1, 1, 1),
(2, 0, 0, 90, 'LC At 90 Days From Delivery Order Date', 1, 1, 1),
(2, 0, 0, 120, 'LC At 120 Days From Delivery Order Date', 1, 1, 1),
(2, 0, 0, 180, 'LC At 180 Days From Delivery Order Date', 1, 1, 1);

CREATE TABLE item_master (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    hsn_code VARCHAR(20),
    status DOUBLE PRECISION DEFAULT 0,
    is_deleted DOUBLE PRECISION DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP WITHOUT TIME ZONE,
    approved_by INTEGER REFERENCES users_master(id),
    approved_date TIMESTAMP WITHOUT TIME ZONE,
    deleted_by INTEGER REFERENCES users_master(id),
    deleted_date TIMESTAMP WITHOUT TIME ZONE
);
COMMENT ON COLUMN item_master.id IS 'Primary key (unique ID for each item)';
COMMENT ON COLUMN item_master.item_name IS 'Name of the item';
COMMENT ON COLUMN item_master.description IS 'Detailed description of the item';
COMMENT ON COLUMN item_master.hsn_code IS 'HSN code (used for tax/GST classification)';
COMMENT ON COLUMN item_master.status IS 'Item status (0 = inactive, 1 = active, etc.)';
COMMENT ON COLUMN item_master.is_deleted IS 'Soft delete flag (0 = available, 1 = deleted)';
COMMENT ON COLUMN item_master.created_by IS 'User ID who created the record';
COMMENT ON COLUMN item_master.created_date IS 'Timestamp when item was created';
COMMENT ON COLUMN item_master.modified_by IS 'User ID who last modified the record';
COMMENT ON COLUMN item_master.modified_date IS 'Timestamp when item was last modified';
COMMENT ON COLUMN item_master.approved_by IS 'User ID who approved the item';
COMMENT ON COLUMN item_master.approved_date IS 'Timestamp when item was approved';
COMMENT ON COLUMN item_master.deleted_by IS 'User ID who deleted the item';
COMMENT ON COLUMN item_master.deleted_date IS 'Timestamp when item was deleted';
CREATE INDEX idx_item_master_status ON item_master(status);
CREATE INDEX idx_item_master_is_deleted ON item_master(is_deleted);


CREATE TABLE sales_order (
    id SERIAL PRIMARY KEY, -- Unique booking ID
    booking_date DATE NOT NULL, -- Booking date
    so_no VARCHAR(50) UNIQUE, -- Sales Order Number (optional)
    current_financial_year VARCHAR(20) NOT NULL, -- Current financial year (e.g., 2023-2024)
    so_sequence_no INTEGER, -- Sequence number for SO in the financial year
    org_id INTEGER NOT NULL REFERENCES organizations_master(id), -- Organization ID (reference to organization)
    buyer_address TEXT NOT NULL, -- Buyer full address
    payment_term_id INTEGER NOT NULL REFERENCES payment_term_master(id), -- Payment term reference
    delivery_city_id INTEGER NOT NULL REFERENCES city_master(id), -- Delivery city reference
    sales_person_id INTEGER NOT NULL REFERENCES users_master(id), -- Sales person handling booking
    crm_person_id INTEGER NOT NULL REFERENCES users_master(id), -- CRM person reference
    final_place_of_delivery TEXT NOT NULL, -- Final place of delivery
    customer_email VARCHAR(255) NOT NULL, -- Customer email address
    wire_cable_type_id INTEGER NOT NULL REFERENCES wire_cable_types_master(id), -- Wire/cable type reference
    customer_mobile VARCHAR(10) NOT NULL, -- 10-digit customer mobile number
    remarks TEXT, -- Additional remarks for booking
    status DOUBLE PRECISION DEFAULT 0, -- Booking status (0 = New, 1 = Confirmed, etc.)
    is_deleted DOUBLE PRECISION DEFAULT 0, -- Soft delete flag (0 = Active, 1 = Deleted)
    created_by INTEGER NOT NULL REFERENCES users_master(id), -- User who created the record
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Record creation timestamp
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Record last updated timestamp
    updated_by INTEGER REFERENCES users_master(id) -- User who last updated the record
);

-- Table comment
COMMENT ON TABLE sales_order IS 'Stores sales booking header details';

-- Column comments
COMMENT ON COLUMN sales_order.id IS 'Unique booking identifier (Primary Key)';
COMMENT ON COLUMN sales_order.booking_date IS 'Date of booking';
COMMENT ON COLUMN sales_order.org_id IS 'Reference to organization placing the booking';
COMMENT ON COLUMN sales_order.buyer_address IS 'Full address of the buyer';
COMMENT ON COLUMN sales_order.payment_term_id IS 'Reference to payment terms (e.g., Net30)';
COMMENT ON COLUMN sales_order.delivery_city_id IS 'Reference to delivery city';
COMMENT ON COLUMN sales_order.sales_person_id IS 'Reference to sales person handling booking';
COMMENT ON COLUMN sales_order.crm_person_id IS 'Reference to CRM person assigned';
COMMENT ON COLUMN sales_order.final_place_of_delivery IS 'Final delivery place of goods';
COMMENT ON COLUMN sales_order.customer_email IS 'Customer email address';
COMMENT ON COLUMN sales_order.wire_cable_type_id IS 'Reference to wire or cable type';
COMMENT ON COLUMN sales_order.customer_mobile IS 'Customer 10-digit mobile number';
COMMENT ON COLUMN sales_order.remarks IS 'Additional remarks about booking';
COMMENT ON COLUMN sales_order.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN sales_order.updated_at IS 'Timestamp when record was last updated';
COMMENT ON COLUMN sales_order.created_by IS 'User who created the record';
COMMENT ON COLUMN sales_order.updated_by IS 'User who last updated the record';
-- Indexes for performance
CREATE INDEX idx_sales_order_org_id ON sales_order(org_id);
CREATE INDEX idx_sales_order_payment_term_id ON sales_order(payment_term_id);
CREATE INDEX idx_sales_order_delivery_city_id ON sales_order(delivery_city_id);
CREATE INDEX idx_sales_order_sales_person_id ON sales_order(sales_person_id);
CREATE INDEX idx_sales_order_crm_person_id ON sales_order(crm_person_id);
CREATE INDEX idx_sales_order_wire_cable_type_id ON sales_order(wire_cable_type_id);
CREATE INDEX idx_sales_order_status ON sales_order(status);
CREATE INDEX idx_sales_order_is_deleted ON sales_order(is_deleted);
CREATE INDEX idx_sales_order_created_by ON sales_order(created_by);
CREATE INDEX idx_sales_order_updated_by ON sales_order(updated_by);


CREATE TABLE rel_sales_order_items (
    id SERIAL PRIMARY KEY, -- Unique item line ID
    so_id INTEGER NOT NULL REFERENCES sales_order(id) ON DELETE CASCADE, -- FK to sales_order
    item_id INTEGER NOT NULL REFERENCES item_master(id), -- Item reference (e.g., product, material)
    quantity DOUBLE PRECISION DEFAULT 0, -- Ordered quantity
    uom_id INTEGER NOT NULL REFERENCES unit_type_master(id), -- Unit of Measurement reference
    material_requirement_date DATE NOT NULL, -- Date when material is required
    rate DOUBLE PRECISION DEFAULT 0, -- Rate per unit
    amount DOUBLE PRECISION DEFAULT 0 -- Total amount = quantity × rate
);

-- Table comment
COMMENT ON TABLE rel_sales_order_items IS 'Stores items related to a sales booking';

-- Column comments
COMMENT ON COLUMN rel_sales_order_items.id IS 'Unique booking item identifier (Primary Key)';
COMMENT ON COLUMN rel_sales_order_items.so_id IS 'Reference to sales_order (FK)';
COMMENT ON COLUMN rel_sales_order_items.item_id IS 'Reference to item/product';
COMMENT ON COLUMN rel_sales_order_items.quantity IS 'Quantity ordered for the item';
COMMENT ON COLUMN rel_sales_order_items.uom_id IS 'Reference to Unit of Measurement (UOM)';
COMMENT ON COLUMN rel_sales_order_items.material_requirement_date IS 'Date when material is required by customer';
COMMENT ON COLUMN rel_sales_order_items.rate IS 'Rate per unit of the item';
COMMENT ON COLUMN rel_sales_order_items.amount IS 'Total amount calculated as quantity × rate';

-- Indexes for performance
CREATE INDEX idx_rel_sales_order_items_so_id ON rel_sales_order_items(so_id);
CREATE INDEX idx_rel_sales_order_items_item_id ON rel_sales_order_items(item_id);
CREATE INDEX idx_rel_sales_order_items_uom_id ON rel_sales_order_items(uom_id);

