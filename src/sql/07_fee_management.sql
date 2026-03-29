CREATE TABLE fee_type_master (
    id              SERIAL PRIMARY KEY,
    fee_type_name   VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    is_active       INTEGER DEFAULT 1,
    created_by      INTEGER NOT NULL,
    created_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by     INTEGER,
    modified_date   TIMESTAMP,
    deleted_by      INTEGER,
    deleted_date    TIMESTAMP,

    CONSTRAINT fk_fee_type_created_by FOREIGN KEY (created_by) REFERENCES users_master(id),
    CONSTRAINT fk_fee_type_modified_by FOREIGN KEY (modified_by) REFERENCES users_master(id),
    CONSTRAINT fk_fee_type_deleted_by FOREIGN KEY (deleted_by) REFERENCES users_master(id)
);
COMMENT ON COLUMN fee_type_master.id            IS 'Primary key, auto-incremented unique identifier';
COMMENT ON COLUMN fee_type_master.fee_type_name IS 'Name of fee type (e.g., Tuition Fee, Transport Fee)';
COMMENT ON COLUMN fee_type_master.description   IS 'Description of the fee type';
COMMENT ON COLUMN fee_type_master.is_active     IS '2: deleted, 1: active, 0: inactive';
COMMENT ON COLUMN fee_type_master.created_by    IS 'ID of the user who created this record';
COMMENT ON COLUMN fee_type_master.created_date  IS 'Timestamp when this record was created';
COMMENT ON COLUMN fee_type_master.modified_by   IS 'ID of the user who last modified this record';
COMMENT ON COLUMN fee_type_master.modified_date IS 'Timestamp when this record was last modified';
COMMENT ON COLUMN fee_type_master.deleted_by    IS 'ID of the user who soft-deleted this record';
COMMENT ON COLUMN fee_type_master.deleted_date  IS 'Timestamp when this record was soft-deleted';

INSERT INTO fee_type_master (fee_type_name, description, created_by)
VALUES
-- Academic Fees
('Tuition Fee', 'Monthly academic fee', 1),
('Admission Fee', 'One-time admission charge', 1),
('Re-admission Fee', 'Charge for rejoining school', 1),
('Annual Fee', 'Yearly school maintenance fee', 1),
('Development Fee', 'Infrastructure development charges', 1),

-- Transport & Facilities
('Transport Fee', 'School bus/transport charges', 1),
('Hostel Fee', 'Hostel accommodation charges', 1),
('Mess Fee', 'Food and dining charges', 1),

-- Academic Support
('Library Fee', 'Library usage charges', 1),
('Lab Fee', 'Laboratory usage fee', 1),
('Computer Fee', 'Computer lab and IT services', 1),
('Smart Class Fee', 'Digital classroom charges', 1),

-- Exams & Certification
('Exam Fee', 'Examination charges', 1),
('Board Exam Fee', 'Board examination charges', 1),
('Certificate Fee', 'Certificate issuance fee', 1),

-- Student Essentials
('Books Fee', 'Textbooks and study materials', 1),
('Uniform Fee', 'School uniform charges', 1),
('ID Card Fee', 'Student ID card charges', 1),

-- Activities
('Sports Fee', 'Sports and physical activities', 1),
('Activity Fee', 'Extra-curricular activities', 1),
('Event Fee', 'School events participation', 1),
('Cultural Fee', 'Cultural programs and functions', 1),
('Field Trip Fee', 'Educational trips and tours', 1),

-- Health & Safety
('Medical Fee', 'Basic medical facilities', 1),
('Insurance Fee', 'Student insurance coverage', 1),
('Security Fee', 'Security services charges', 1),

-- Financial Adjustments
('Late Fee', 'Penalty for late payment', 1),
('Fine', 'General penalties or fines', 1),
('Discount', 'Fee discount adjustment', 1),
('Scholarship', 'Scholarship adjustment', 1),

-- Miscellaneous
('Maintenance Fee', 'School maintenance charges', 1),
('Alumni Fee', 'Alumni association charges', 1),
('Application Fee', 'Application form fee', 1),
('Registration Fee', 'Registration charges', 1),
('Prospectus Fee', 'School prospectus cost', 1),

-- Refundable / Deposits
('Security Deposit', 'Refundable security amount', 1),
('Caution Deposit', 'Refundable caution money', 1);

CREATE TABLE fee_structure (
    id              SERIAL PRIMARY KEY,
    class_id        INT NOT NULL,
    fee_type_id     INT NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,
    frequency       VARCHAR(20) NOT NULL,
    academic_year   VARCHAR(20) NOT NULL,
    due_day         INT,
    late_fee_amount DECIMAL(10,2) DEFAULT 0,
    is_active       INTEGER DEFAULT 1,
    created_by      INTEGER,
    created_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by     INTEGER,
    modified_date   TIMESTAMP,
    deleted_by      INTEGER,
    deleted_date    TIMESTAMP,

    CONSTRAINT fk_fee_structure_class FOREIGN KEY (class_id) REFERENCES class_master(id),
    CONSTRAINT fk_fee_structure_fee_type FOREIGN KEY (fee_type_id) REFERENCES fee_type_master(id),
    CONSTRAINT fk_fee_structure_created   FOREIGN KEY (created_by) REFERENCES users_master(id),
    CONSTRAINT fk_fee_structure_modified  FOREIGN KEY (modified_by) REFERENCES users_master(id),
    CONSTRAINT fk_fee_structure_deleted   FOREIGN KEY (deleted_by)  REFERENCES users_master(id)
);
COMMENT ON COLUMN fee_structure.id              IS 'Primary key, auto-incremented unique identifier';
COMMENT ON COLUMN fee_structure.class_id        IS 'Foreign key referencing class_master';
COMMENT ON COLUMN fee_structure.fee_type_id     IS 'Foreign key referencing fee_type_master';
COMMENT ON COLUMN fee_structure.amount          IS 'Base fee amount';
COMMENT ON COLUMN fee_structure.frequency       IS 'Fee frequency (monthly, yearly, one_time)';
COMMENT ON COLUMN fee_structure.academic_year   IS 'Academic year (e.g., 2025-26)';
COMMENT ON COLUMN fee_structure.due_day         IS 'Due day of month (e.g., 10)';
COMMENT ON COLUMN fee_structure.late_fee_amount IS 'Late fee amount';
COMMENT ON COLUMN fee_structure.is_active       IS '2: deleted, 1: active, 0: inactive';
COMMENT ON COLUMN fee_structure.created_by      IS 'ID of the user who created this record';
COMMENT ON COLUMN fee_structure.created_date    IS 'Timestamp when this record was created';
COMMENT ON COLUMN fee_structure.modified_by     IS 'ID of the user who last modified this record';
COMMENT ON COLUMN fee_structure.modified_date   IS 'Timestamp when this record was last modified';
COMMENT ON COLUMN fee_structure.deleted_by      IS 'ID of the user who soft-deleted this record';
COMMENT ON COLUMN fee_structure.deleted_date    IS 'Timestamp when this record was soft-deleted';

INSERT INTO fee_structure 
(class_id, fee_type_id, amount, frequency, academic_year, due_day, created_by)

SELECT 
    c.class_id,
    ft.id AS fee_type_id,

    CASE 
        WHEN ft.fee_type_name = 'Tuition Fee' THEN 1500 + (c.class_id * 200)
        WHEN ft.fee_type_name = 'Transport Fee' THEN 500 + (c.class_id * 50)
        WHEN ft.fee_type_name = 'Exam Fee' THEN 300 + (c.class_id * 50)
        WHEN ft.fee_type_name = 'Admission Fee' THEN 2000
        ELSE 100
    END AS amount,

    CASE 
        WHEN ft.fee_type_name IN ('Tuition Fee','Transport Fee') THEN 'Monthly'
        WHEN ft.fee_type_name = 'Exam Fee' THEN 'Quarterly'
        WHEN ft.fee_type_name = 'Admission Fee' THEN 'One-time'
        ELSE 'Yearly'
    END AS frequency,

    '2025-26' AS academic_year,
    10 AS due_day,
    1 AS created_by

FROM 
(
    SELECT generate_series(1,12) AS class_id
) c

JOIN fee_type_master ft 
ON ft.fee_type_name IN (
    'Tuition Fee',
    'Transport Fee',
    'Exam Fee',
    'Admission Fee'
);
CREATE TABLE fee_assignment (
    id                SERIAL PRIMARY KEY,
    st_id             INT NOT NULL,
    fee_structure_id  INT NOT NULL,
    amount            DECIMAL(10,2) NOT NULL,
    discount_amount   DECIMAL(10,2) DEFAULT 0,
    final_amount      DECIMAL(10,2) NOT NULL,
    start_date        DATE NOT NULL,
    end_date          DATE,
    is_active         INTEGER DEFAULT 1,
    created_by        INTEGER,
    created_date      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by       INTEGER,
    modified_date     TIMESTAMP,
    deleted_by        INTEGER,
    deleted_date      TIMESTAMP,

    CONSTRAINT fk_fee_assignment_student FOREIGN KEY (st_id) REFERENCES student_master(id),
    CONSTRAINT fk_fee_assignment_structure FOREIGN KEY (fee_structure_id) REFERENCES fee_structure(id),
    CONSTRAINT fk_fee_assignment_created FOREIGN KEY (created_by) REFERENCES users_master(id),
    CONSTRAINT fk_fee_assignment_modified FOREIGN KEY (modified_by) REFERENCES users_master(id),
    CONSTRAINT fk_fee_assignment_deleted FOREIGN KEY (deleted_by) REFERENCES users_master(id)
);
COMMENT ON COLUMN fee_assignment.id               IS 'Primary key, auto-incremented unique identifier';
COMMENT ON COLUMN fee_assignment.st_id            IS 'Foreign key referencing student_master';
COMMENT ON COLUMN fee_assignment.fee_structure_id IS 'Foreign key referencing fee_structure';
COMMENT ON COLUMN fee_assignment.amount           IS 'Original fee amount';
COMMENT ON COLUMN fee_assignment.discount_amount  IS 'Discount applied on fee';
COMMENT ON COLUMN fee_assignment.final_amount     IS 'Final payable amount after discount';
COMMENT ON COLUMN fee_assignment.start_date       IS 'Fee start date';
COMMENT ON COLUMN fee_assignment.end_date         IS 'Fee end date';
COMMENT ON COLUMN fee_assignment.is_active        IS '2: deleted, 1: active, 0: inactive';
COMMENT ON COLUMN fee_assignment.created_by       IS 'ID of the user who created this record';
COMMENT ON COLUMN fee_assignment.created_date     IS 'Timestamp when this record was created';
COMMENT ON COLUMN fee_assignment.modified_by      IS 'ID of the user who last modified this record';
COMMENT ON COLUMN fee_assignment.modified_date    IS 'Timestamp when this record was last modified';
COMMENT ON COLUMN fee_assignment.deleted_by       IS 'ID of the user who soft-deleted this record';
COMMENT ON COLUMN fee_assignment.deleted_date     IS 'Timestamp when this record was soft-deleted';