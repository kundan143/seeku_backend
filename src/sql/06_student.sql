CREATE TABLE class_master (
    id            SERIAL       PRIMARY KEY,
    class_name    VARCHAR(50)  NOT NULL,
    class_code    VARCHAR(20),
    description   VARCHAR(255),
    is_active     SMALLINT     DEFAULT 1,
    created_by    INTEGER      NOT NULL,
    created_date  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    modified_by   INTEGER,
    modified_date TIMESTAMP,
    deleted_by    INTEGER,
    deleted_date  TIMESTAMP,
    CONSTRAINT uq_class_name        UNIQUE (class_name),
    CONSTRAINT fk_class_created_by  FOREIGN KEY (created_by)  REFERENCES users_master(id),
    CONSTRAINT fk_class_modified_by FOREIGN KEY (modified_by) REFERENCES users_master(id),
    CONSTRAINT fk_class_deleted_by  FOREIGN KEY (deleted_by)  REFERENCES users_master(id)
);

COMMENT ON COLUMN class_master.id            IS 'Primary key, auto-incremented unique identifier';
COMMENT ON COLUMN class_master.class_name    IS 'Name of the class (e.g. Grade 1, Class A)';
COMMENT ON COLUMN class_master.class_code    IS 'Short code representing the class (e.g. CLS01)';
COMMENT ON COLUMN class_master.description   IS 'Optional description or notes about the class';
COMMENT ON COLUMN class_master.is_active     IS '2: deleted, 1: active, 0: inactive';
COMMENT ON COLUMN class_master.created_by    IS 'ID of the user who created this record';
COMMENT ON COLUMN class_master.created_date  IS 'Timestamp when this record was created';
COMMENT ON COLUMN class_master.modified_by   IS 'ID of the user who last modified this record';
COMMENT ON COLUMN class_master.modified_date IS 'Timestamp when this record was last modified';
COMMENT ON COLUMN class_master.deleted_by    IS 'ID of the user who soft-deleted this record';
COMMENT ON COLUMN class_master.deleted_date  IS 'Timestamp when this record was soft-deleted';


CREATE TABLE section_master (
    id            SERIAL       PRIMARY KEY,
    class_id      INT          NOT NULL,
    section_name  VARCHAR(50)  NOT NULL,
    section_code  VARCHAR(20),
    is_active     SMALLINT     DEFAULT 1,
    created_by    INTEGER      NOT NULL,
    created_date  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    modified_by   INTEGER,
    modified_date TIMESTAMP,
    deleted_by    INTEGER,
    deleted_date  TIMESTAMP,
    CONSTRAINT uq_class_section       UNIQUE (class_id, section_name),
    CONSTRAINT fk_section_class       FOREIGN KEY (class_id)   REFERENCES class_master(id),
    CONSTRAINT fk_section_created_by  FOREIGN KEY (created_by)  REFERENCES users_master(id),
    CONSTRAINT fk_section_modified_by FOREIGN KEY (modified_by) REFERENCES users_master(id),
    CONSTRAINT fk_section_deleted_by  FOREIGN KEY (deleted_by)  REFERENCES users_master(id)
);

COMMENT ON COLUMN section_master.id            IS 'Primary key, auto-incremented unique identifier';
COMMENT ON COLUMN section_master.class_id      IS 'Foreign key referencing the class this section belongs to';
COMMENT ON COLUMN section_master.section_name  IS 'Name of the section (e.g. Section A, Section B)';
COMMENT ON COLUMN section_master.section_code  IS 'Short code representing the section (e.g. SEC-A)';
COMMENT ON COLUMN section_master.is_active     IS '2: deleted, 1: active, 0: inactive';
COMMENT ON COLUMN section_master.created_by    IS 'ID of the user who created this record';
COMMENT ON COLUMN section_master.created_date  IS 'Timestamp when this record was created';
COMMENT ON COLUMN section_master.modified_by   IS 'ID of the user who last modified this record';
COMMENT ON COLUMN section_master.modified_date IS 'Timestamp when this record was last modified';
COMMENT ON COLUMN section_master.deleted_by    IS 'ID of the user who soft-deleted this record';
COMMENT ON COLUMN section_master.deleted_date  IS 'Timestamp when this record was soft-deleted';

CREATE TABLE public.subject_master (
    id                  SERIAL PRIMARY KEY,
    subject_name        VARCHAR(100) NOT NULL,
    subject_code        VARCHAR(50),
    subject_type        VARCHAR(50),
    class_id            INTEGER REFERENCES public.class_master(id) ON UPDATE CASCADE ON DELETE SET NULL,
    section_id          INTEGER REFERENCES public.section_master(id) ON UPDATE CASCADE ON DELETE SET NULL,
    description         TEXT,
    is_active           INTEGER DEFAULT 1,
    created_by          INTEGER      NOT NULL,
    created_date        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    modified_by         INTEGER,
    modified_date       TIMESTAMP,
    deleted_by          INTEGER,
    deleted_date        TIMESTAMP,
    CONSTRAINT fk_email_created  FOREIGN KEY (created_by)  REFERENCES users_master(id),
    CONSTRAINT fk_email_modified FOREIGN KEY (modified_by) REFERENCES users_master(id),
    CONSTRAINT fk_email_deleted  FOREIGN KEY (deleted_by)  REFERENCES users_master(id)
);

-- Table comment
COMMENT ON TABLE public.subject_master IS 'Stores subject information linked to class and section';

-- Column comments
COMMENT ON COLUMN public.subject_master.id            IS 'Primary key, auto-incremented unique identifier for each subject';
COMMENT ON COLUMN public.subject_master.subject_name  IS 'Name of the subject (e.g. Mathematics, Science, English)';
COMMENT ON COLUMN public.subject_master.subject_code  IS 'Short unique code for the subject (e.g. MATH101, SCI101)';
COMMENT ON COLUMN public.subject_master.subject_type  IS 'Type of subject - e.g. Core, Elective, Optional, Extra Curricular';
COMMENT ON COLUMN public.subject_master.class_id      IS 'Foreign key referencing class_master(id) - class to which subject belongs';
COMMENT ON COLUMN public.subject_master.section_id    IS 'Foreign key referencing section_master(id) - section to which subject belongs';
COMMENT ON COLUMN public.subject_master.description   IS 'Optional detailed description about the subject';
COMMENT ON COLUMN public.subject_master.is_active     IS '1 = Active, 0 = Inactive, 2 = Deleted (soft delete flag)';
COMMENT ON COLUMN public.subject_master.created_by    IS 'User ID of the person who created this record';
COMMENT ON COLUMN public.subject_master.created_date  IS 'Timestamp when the record was created, defaults to current time';
COMMENT ON COLUMN public.subject_master.modified_by   IS 'User ID of the person who last modified this record';
COMMENT ON COLUMN public.subject_master.modified_date IS 'Timestamp when the record was last modified';
COMMENT ON COLUMN public.subject_master.deleted_by    IS 'User ID of the person who soft-deleted this record';
COMMENT ON COLUMN public.subject_master.deleted_date  IS 'Timestamp when the record was soft-deleted';

INSERT INTO public.subject_master (subject_name, subject_code, subject_type, class_id, is_active, created_by, created_date)
VALUES

-- Class I (class_id = 1)
('English',              'ENG-I',       'Core',     1, 1, 1, NOW()),
('Hindi',                'HIN-I',       'Core',     1, 1, 1, NOW()),
('Mathematics',          'MATH-I',      'Core',     1, 1, 1, NOW()),
('Environmental Studies','EVS-I',       'Core',     1, 1, 1, NOW()),
('General Knowledge',    'GK-I',        'Optional', 1, 1, 1, NOW()),
('Drawing & Craft',      'DRAW-I',      'Extra Curricular', 1, 1, 1, NOW()),

-- Class II (class_id = 2)
('English',              'ENG-II',      'Core',     2, 1, 1, NOW()),
('Hindi',                'HIN-II',      'Core',     2, 1, 1, NOW()),
('Mathematics',          'MATH-II',     'Core',     2, 1, 1, NOW()),
('Environmental Studies','EVS-II',      'Core',     2, 1, 1, NOW()),
('General Knowledge',    'GK-II',       'Optional', 2, 1, 1, NOW()),
('Drawing & Craft',      'DRAW-II',     'Extra Curricular', 2, 1, 1, NOW()),

-- Class III (class_id = 3)
('English',              'ENG-III',     'Core',     3, 1, 1, NOW()),
('Hindi',                'HIN-III',     'Core',     3, 1, 1, NOW()),
('Mathematics',          'MATH-III',    'Core',     3, 1, 1, NOW()),
('Environmental Studies','EVS-III',     'Core',     3, 1, 1, NOW()),
('General Knowledge',    'GK-III',      'Optional', 3, 1, 1, NOW()),
('Drawing & Craft',      'DRAW-III',    'Extra Curricular', 3, 1, 1, NOW()),

-- Class IV (class_id = 4)
('English',              'ENG-IV',      'Core',     4, 1, 1, NOW()),
('Hindi',                'HIN-IV',      'Core',     4, 1, 1, NOW()),
('Mathematics',          'MATH-IV',     'Core',     4, 1, 1, NOW()),
('Environmental Studies','EVS-IV',      'Core',     4, 1, 1, NOW()),
('General Knowledge',    'GK-IV',       'Optional', 4, 1, 1, NOW()),
('Drawing & Craft',      'DRAW-IV',     'Extra Curricular', 4, 1, 1, NOW()),

-- Class V (class_id = 5)
('English',              'ENG-V',       'Core',     5, 1, 1, NOW()),
('Hindi',                'HIN-V',       'Core',     5, 1, 1, NOW()),
('Mathematics',          'MATH-V',      'Core',     5, 1, 1, NOW()),
('Environmental Studies','EVS-V',       'Core',     5, 1, 1, NOW()),
('General Knowledge',    'GK-V',        'Optional', 5, 1, 1, NOW()),
('Drawing & Craft',      'DRAW-V',      'Extra Curricular', 5, 1, 1, NOW()),

-- Class VI (class_id = 6)
('English',              'ENG-VI',      'Core',     6, 1, 1, NOW()),
('Hindi',                'HIN-VI',      'Core',     6, 1, 1, NOW()),
('Mathematics',          'MATH-VI',     'Core',     6, 1, 1, NOW()),
('Science',              'SCI-VI',      'Core',     6, 1, 1, NOW()),
('Social Science',       'SST-VI',      'Core',     6, 1, 1, NOW()),
('Sanskrit',             'SAN-VI',      'Optional', 6, 1, 1, NOW()),
('General Knowledge',    'GK-VI',       'Optional', 6, 1, 1, NOW()),
('Drawing & Craft',      'DRAW-VI',     'Extra Curricular', 6, 1, 1, NOW()),

-- Class VII (class_id = 7)
('English',              'ENG-VII',     'Core',     7, 1, 1, NOW()),
('Hindi',                'HIN-VII',     'Core',     7, 1, 1, NOW()),
('Mathematics',          'MATH-VII',    'Core',     7, 1, 1, NOW()),
('Science',              'SCI-VII',     'Core',     7, 1, 1, NOW()),
('Social Science',       'SST-VII',     'Core',     7, 1, 1, NOW()),
('Sanskrit',             'SAN-VII',     'Optional', 7, 1, 1, NOW()),
('General Knowledge',    'GK-VII',      'Optional', 7, 1, 1, NOW()),
('Drawing & Craft',      'DRAW-VII',    'Extra Curricular', 7, 1, 1, NOW()),

-- Class VIII (class_id = 8)
('English',              'ENG-VIII',    'Core',     8, 1, 1, NOW()),
('Hindi',                'HIN-VIII',    'Core',     8, 1, 1, NOW()),
('Mathematics',          'MATH-VIII',   'Core',     8, 1, 1, NOW()),
('Science',              'SCI-VIII',    'Core',     8, 1, 1, NOW()),
('Social Science',       'SST-VIII',    'Core',     8, 1, 1, NOW()),
('Sanskrit',             'SAN-VIII',    'Optional', 8, 1, 1, NOW()),
('General Knowledge',    'GK-VIII',     'Optional', 8, 1, 1, NOW()),
('Drawing & Craft',      'DRAW-VIII',   'Extra Curricular', 8, 1, 1, NOW()),

-- Class IX (class_id = 9)
('English',              'ENG-IX',      'Core',     9, 1, 1, NOW()),
('Hindi',                'HIN-IX',      'Core',     9, 1, 1, NOW()),
('Mathematics',          'MATH-IX',     'Core',     9, 1, 1, NOW()),
('Science',              'SCI-IX',      'Core',     9, 1, 1, NOW()),
('Social Science',       'SST-IX',      'Core',     9, 1, 1, NOW()),
('Sanskrit',             'SAN-IX',      'Optional', 9, 1, 1, NOW()),
('Information Technology','IT-IX',      'Elective', 9, 1, 1, NOW()),
('General Knowledge',    'GK-IX',       'Optional', 9, 1, 1, NOW()),

-- Class X (class_id = 10)
('English',              'ENG-X',       'Core',     10, 1, 1, NOW()),
('Hindi',                'HIN-X',       'Core',     10, 1, 1, NOW()),
('Mathematics',          'MATH-X',      'Core',     10, 1, 1, NOW()),
('Science',              'SCI-X',       'Core',     10, 1, 1, NOW()),
('Social Science',       'SST-X',       'Core',     10, 1, 1, NOW()),
('Sanskrit',             'SAN-X',       'Optional', 10, 1, 1, NOW()),
('Information Technology','IT-X',       'Elective', 10, 1, 1, NOW()),
('General Knowledge',    'GK-X',        'Optional', 10, 1, 1, NOW()),

-- Class XI (class_id = 11)
('English',              'ENG-XI',      'Core',     11, 1, 1, NOW()),
('Physics',              'PHY-XI',      'Core',     11, 1, 1, NOW()),
('Chemistry',            'CHEM-XI',     'Core',     11, 1, 1, NOW()),
('Mathematics',          'MATH-XI',     'Core',     11, 1, 1, NOW()),
('Biology',              'BIO-XI',      'Elective', 11, 1, 1, NOW()),
('Computer Science',     'CS-XI',       'Elective', 11, 1, 1, NOW()),
('Accountancy',          'ACC-XI',      'Elective', 11, 1, 1, NOW()),
('Business Studies',     'BS-XI',       'Elective', 11, 1, 1, NOW()),
('Economics',            'ECO-XI',      'Elective', 11, 1, 1, NOW()),
('History',              'HIS-XI',      'Elective', 11, 1, 1, NOW()),
('Geography',            'GEO-XI',      'Elective', 11, 1, 1, NOW()),
('Physical Education',   'PE-XI',       'Extra Curricular', 11, 1, 1, NOW()),

-- Class XII (class_id = 12)
('English',              'ENG-XII',     'Core',     12, 1, 1, NOW()),
('Physics',              'PHY-XII',     'Core',     12, 1, 1, NOW()),
('Chemistry',            'CHEM-XII',    'Core',     12, 1, 1, NOW()),
('Mathematics',          'MATH-XII',    'Core',     12, 1, 1, NOW()),
('Biology',              'BIO-XII',     'Elective', 12, 1, 1, NOW()),
('Computer Science',     'CS-XII',      'Elective', 12, 1, 1, NOW()),
('Accountancy',          'ACC-XII',     'Elective', 12, 1, 1, NOW()),
('Business Studies',     'BS-XII',      'Elective', 12, 1, 1, NOW()),
('Economics',            'ECO-XII',     'Elective', 12, 1, 1, NOW()),
('History',              'HIS-XII',     'Elective', 12, 1, 1, NOW()),
('Geography',            'GEO-XII',     'Elective', 12, 1, 1, NOW()),
('Physical Education',   'PE-XII',      'Extra Curricular', 12, 1, 1, NOW());

CREATE TABLE student_master (
    id             SERIAL       PRIMARY KEY,
    first_name     VARCHAR(100) NOT NULL,
    middle_name    VARCHAR(100),
    last_name      VARCHAR(100) NOT NULL,
    gender_id      INT,
    st_no          VARCHAR(50),
    sequence_no    INT,
    date_of_birth  DATE,
    blood_group_id INT,
    photo_url      VARCHAR(255),
    category_id    INT,
    is_active      SMALLINT     DEFAULT 1,
    created_by     INTEGER      NOT NULL,
    created_date   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    modified_by    INTEGER,
    modified_date  TIMESTAMP,
    deleted_by     INTEGER,
    deleted_date   TIMESTAMP,
    CONSTRAINT fk_student_gender       FOREIGN KEY (gender_id)      REFERENCES gender_master(id),
    CONSTRAINT fk_student_blood_group  FOREIGN KEY (blood_group_id) REFERENCES blood_group_master(id),
    CONSTRAINT fk_student_created_by   FOREIGN KEY (created_by)     REFERENCES users_master(id),
    CONSTRAINT fk_student_modified_by  FOREIGN KEY (modified_by)    REFERENCES users_master(id),
    CONSTRAINT fk_student_deleted_by   FOREIGN KEY (deleted_by)     REFERENCES users_master(id)
);

COMMENT ON COLUMN student_master.id             IS 'Primary key, auto-incremented unique identifier';
COMMENT ON COLUMN student_master.first_name     IS 'First name of the student';
COMMENT ON COLUMN student_master.middle_name    IS 'Middle name of the student (optional)';
COMMENT ON COLUMN student_master.last_name      IS 'Last name / surname of the student';
COMMENT ON COLUMN student_master.gender_id      IS 'Foreign key referencing gender_master';
COMMENT ON COLUMN student_master.st_no          IS 'Student number or registration number';
COMMENT ON COLUMN student_master.sequence_no    IS 'Sequence number used for ordering or roll purposes';
COMMENT ON COLUMN student_master.date_of_birth  IS 'Date of birth of the student';
COMMENT ON COLUMN student_master.blood_group_id IS 'Foreign key referencing blood_group_master';
COMMENT ON COLUMN student_master.photo_url      IS 'URL or path to the student profile photo';
COMMENT ON COLUMN student_master.category_id    IS 'Foreign key referencing category_master (e.g. General, OBC, SC)';
COMMENT ON COLUMN student_master.is_active      IS '2: deleted, 1: active, 0: inactive';
COMMENT ON COLUMN student_master.created_by     IS 'ID of the user who created this record';
COMMENT ON COLUMN student_master.created_date   IS 'Timestamp when this record was created';
COMMENT ON COLUMN student_master.modified_by    IS 'ID of the user who last modified this record';
COMMENT ON COLUMN student_master.modified_date  IS 'Timestamp when this record was last modified';
COMMENT ON COLUMN student_master.deleted_by     IS 'ID of the user who soft-deleted this record';
COMMENT ON COLUMN student_master.deleted_date   IS 'Timestamp when this record was soft-deleted';


CREATE TABLE mobile_master (
    id            SERIAL       PRIMARY KEY,
    st_id         INTEGER,
    emp_id        INTEGER,
    mobile_no     VARCHAR(15)  NOT NULL,
    is_primary    SMALLINT     DEFAULT 0,
    is_active     SMALLINT     DEFAULT 1,
    created_by    INTEGER      NOT NULL,
    created_date  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    modified_by   INTEGER,
    modified_date TIMESTAMP,
    deleted_by    INTEGER,
    deleted_date  TIMESTAMP,
    CONSTRAINT fk_mobile_student   FOREIGN KEY (st_id)      REFERENCES student_master(id),
    CONSTRAINT fk_mobile_employee  FOREIGN KEY (emp_id)     REFERENCES users_master(id),
    CONSTRAINT fk_mobile_created   FOREIGN KEY (created_by) REFERENCES users_master(id),
    CONSTRAINT fk_mobile_modified  FOREIGN KEY (modified_by) REFERENCES users_master(id),
    CONSTRAINT fk_mobile_deleted   FOREIGN KEY (deleted_by)  REFERENCES users_master(id)
);

COMMENT ON COLUMN mobile_master.id            IS 'Primary key, auto-incremented unique identifier';
COMMENT ON COLUMN mobile_master.st_id         IS 'Foreign key referencing the student (null if belongs to employee)';
COMMENT ON COLUMN mobile_master.emp_id        IS 'Foreign key referencing the employee (null if belongs to student)';
COMMENT ON COLUMN mobile_master.mobile_no     IS 'Mobile phone number';
COMMENT ON COLUMN mobile_master.is_primary    IS '1: primary contact number, 0: secondary';
COMMENT ON COLUMN mobile_master.is_active     IS '2: deleted, 1: active, 0: inactive';
COMMENT ON COLUMN mobile_master.created_by    IS 'ID of the user who created this record';
COMMENT ON COLUMN mobile_master.created_date  IS 'Timestamp when this record was created';
COMMENT ON COLUMN mobile_master.modified_by   IS 'ID of the user who last modified this record';
COMMENT ON COLUMN mobile_master.modified_date IS 'Timestamp when this record was last modified';
COMMENT ON COLUMN mobile_master.deleted_by    IS 'ID of the user who soft-deleted this record';
COMMENT ON COLUMN mobile_master.deleted_date  IS 'Timestamp when this record was soft-deleted';


CREATE TABLE email_master (
    id              SERIAL       PRIMARY KEY,
    st_id           INTEGER,
    emp_id          INTEGER,
    personal_email  VARCHAR(100),
    official_email  VARCHAR(100),
    is_primary      SMALLINT     DEFAULT 0,
    is_active       SMALLINT     DEFAULT 1,
    created_by      INTEGER      NOT NULL,
    created_date    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    modified_by     INTEGER,
    modified_date   TIMESTAMP,
    deleted_by      INTEGER,
    deleted_date    TIMESTAMP,
    CONSTRAINT fk_email_student  FOREIGN KEY (st_id)       REFERENCES student_master(id),
    CONSTRAINT fk_email_employee FOREIGN KEY (emp_id)      REFERENCES users_master(id),
    CONSTRAINT fk_email_created  FOREIGN KEY (created_by)  REFERENCES users_master(id),
    CONSTRAINT fk_email_modified FOREIGN KEY (modified_by) REFERENCES users_master(id),
    CONSTRAINT fk_email_deleted  FOREIGN KEY (deleted_by)  REFERENCES users_master(id)
);

COMMENT ON COLUMN email_master.id             IS 'Primary key, auto-incremented unique identifier';
COMMENT ON COLUMN email_master.st_id          IS 'Foreign key referencing the student (null if belongs to employee)';
COMMENT ON COLUMN email_master.emp_id         IS 'Foreign key referencing the employee (null if belongs to student)';
COMMENT ON COLUMN email_master.personal_email IS 'Personal email address';
COMMENT ON COLUMN email_master.official_email IS 'Official or school/organization email address';
COMMENT ON COLUMN email_master.is_primary     IS '1: primary email, 0: secondary';
COMMENT ON COLUMN email_master.is_active      IS '2: deleted, 1: active, 0: inactive';
COMMENT ON COLUMN email_master.created_by     IS 'ID of the user who created this record';
COMMENT ON COLUMN email_master.created_date   IS 'Timestamp when this record was created';
COMMENT ON COLUMN email_master.modified_by    IS 'ID of the user who last modified this record';
COMMENT ON COLUMN email_master.modified_date  IS 'Timestamp when this record was last modified';
COMMENT ON COLUMN email_master.deleted_by     IS 'ID of the user who soft-deleted this record';
COMMENT ON COLUMN email_master.deleted_date   IS 'Timestamp when this record was soft-deleted';


CREATE TABLE address_master (
    id            SERIAL       PRIMARY KEY,
    st_id         INTEGER,
    emp_id        INTEGER,
    add_1         VARCHAR(255) NOT NULL,
    add_2         VARCHAR(255),
    landmark      VARCHAR(255),
    city_id       INT          NOT NULL,
    state_id      INT          NOT NULL,
    country_id    INT          NOT NULL,
    pincode       VARCHAR(10),
    is_active     SMALLINT     DEFAULT 1,
    created_by    INTEGER      NOT NULL,
    created_date  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    modified_by   INTEGER,
    modified_date TIMESTAMP,
    deleted_by    INTEGER,
    deleted_date  TIMESTAMP,
    CONSTRAINT fk_addr_student  FOREIGN KEY (st_id)      REFERENCES student_master(id),
    CONSTRAINT fk_addr_employee FOREIGN KEY (emp_id)     REFERENCES users_master(id),
    CONSTRAINT fk_addr_city     FOREIGN KEY (city_id)    REFERENCES city_master(id),
    CONSTRAINT fk_addr_state    FOREIGN KEY (state_id)   REFERENCES state_master(id),
    CONSTRAINT fk_addr_country  FOREIGN KEY (country_id) REFERENCES country_master(id),
    CONSTRAINT fk_addr_created  FOREIGN KEY (created_by) REFERENCES users_master(id),
    CONSTRAINT fk_addr_modified FOREIGN KEY (modified_by) REFERENCES users_master(id),
    CONSTRAINT fk_addr_deleted  FOREIGN KEY (deleted_by)  REFERENCES users_master(id)
);

COMMENT ON COLUMN address_master.id            IS 'Primary key, auto-incremented unique identifier';
COMMENT ON COLUMN address_master.st_id         IS 'Foreign key referencing the student (null if belongs to employee)';
COMMENT ON COLUMN address_master.emp_id        IS 'Foreign key referencing the employee (null if belongs to student)';
COMMENT ON COLUMN address_master.add_1         IS 'Address line 1 (house/flat number, street)';
COMMENT ON COLUMN address_master.add_2         IS 'Address line 2 (area, locality — optional)';
COMMENT ON COLUMN address_master.landmark      IS 'Nearby landmark for easier identification';
COMMENT ON COLUMN address_master.city_id       IS 'Foreign key referencing city_master';
COMMENT ON COLUMN address_master.state_id      IS 'Foreign key referencing state_master';
COMMENT ON COLUMN address_master.country_id    IS 'Foreign key referencing country_master';
COMMENT ON COLUMN address_master.pincode       IS 'Postal / ZIP code of the address';
COMMENT ON COLUMN address_master.is_active     IS '2: deleted, 1: active, 0: inactive';
COMMENT ON COLUMN address_master.created_by    IS 'ID of the user who created this record';
COMMENT ON COLUMN address_master.created_date  IS 'Timestamp when this record was created';
COMMENT ON COLUMN address_master.modified_by   IS 'ID of the user who last modified this record';
COMMENT ON COLUMN address_master.modified_date IS 'Timestamp when this record was last modified';
COMMENT ON COLUMN address_master.deleted_by    IS 'ID of the user who soft-deleted this record';
COMMENT ON COLUMN address_master.deleted_date  IS 'Timestamp when this record was soft-deleted';


CREATE TABLE academic_master (
    id              SERIAL       PRIMARY KEY,
    st_id           INT,
    admission_no    VARCHAR(50)  NOT NULL,
    admission_date  DATE,
    class_id        INT          NOT NULL,
    section_id      INT          NOT NULL,
    roll_no         VARCHAR(20),
    academic_year   VARCHAR(9)          NOT NULL,
    previous_school VARCHAR(255),
    is_active       SMALLINT     DEFAULT 1,
    created_by      INTEGER      NOT NULL,
    created_date    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    modified_by     INTEGER,
    modified_date   TIMESTAMP,
    deleted_by      INTEGER,
    deleted_date    TIMESTAMP,
    CONSTRAINT fk_academic_student  FOREIGN KEY (st_id)      REFERENCES student_master(id),
    CONSTRAINT fk_academic_class    FOREIGN KEY (class_id)   REFERENCES class_master(id),
    CONSTRAINT fk_academic_section  FOREIGN KEY (section_id) REFERENCES section_master(id),
    CONSTRAINT fk_academic_created  FOREIGN KEY (created_by) REFERENCES users_master(id),
    CONSTRAINT fk_academic_modified FOREIGN KEY (modified_by) REFERENCES users_master(id),
    CONSTRAINT fk_academic_deleted  FOREIGN KEY (deleted_by)  REFERENCES users_master(id)
);

COMMENT ON COLUMN academic_master.id              IS 'Primary key, auto-incremented unique identifier';
COMMENT ON COLUMN academic_master.st_id           IS 'Foreign key referencing the student';
COMMENT ON COLUMN academic_master.admission_no    IS 'Unique admission number assigned to the student';
COMMENT ON COLUMN academic_master.admission_date  IS 'Date on which the student was admitted';
COMMENT ON COLUMN academic_master.class_id        IS 'Foreign key referencing the class the student is enrolled in';
COMMENT ON COLUMN academic_master.section_id      IS 'Foreign key referencing the section the student is assigned to';
COMMENT ON COLUMN academic_master.roll_no         IS 'Roll number of the student within the class/section';
COMMENT ON COLUMN academic_master.academic_year   IS 'Academic year of enrollment (e.g. 2024 for 2024–25)';
COMMENT ON COLUMN academic_master.previous_school IS 'Name of the school previously attended by the student';
COMMENT ON COLUMN academic_master.is_active       IS '2: deleted, 1: active, 0: inactive';
COMMENT ON COLUMN academic_master.created_by      IS 'ID of the user who created this record';
COMMENT ON COLUMN academic_master.created_date    IS 'Timestamp when this record was created';
COMMENT ON COLUMN academic_master.modified_by     IS 'ID of the user who last modified this record';
COMMENT ON COLUMN academic_master.modified_date   IS 'Timestamp when this record was last modified';
COMMENT ON COLUMN academic_master.deleted_by      IS 'ID of the user who soft-deleted this record';
COMMENT ON COLUMN academic_master.deleted_date    IS 'Timestamp when this record was soft-deleted';


CREATE TABLE student_parents_master (
    id                  SERIAL       PRIMARY KEY,
    st_id               INT          NOT NULL,
    relation_id         INT          NOT NULL,
    title               VARCHAR(10),
    first_name          VARCHAR(100) NOT NULL,
    middle_name         VARCHAR(100),
    last_name           VARCHAR(100),
    gender_id           INT,
    mobile_no           VARCHAR(15),
    email_id            VARCHAR(100),
    is_primary_guardian SMALLINT     DEFAULT 0,
    is_active           SMALLINT     DEFAULT 1,
    created_by          INTEGER      NOT NULL,
    created_date        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    modified_by         INTEGER,
    modified_date       TIMESTAMP,
    deleted_by          INTEGER,
    deleted_date        TIMESTAMP,
    CONSTRAINT fk_parents_student  FOREIGN KEY (st_id)      REFERENCES student_master(id),
    CONSTRAINT fk_parents_created  FOREIGN KEY (created_by) REFERENCES users_master(id),
    CONSTRAINT fk_parents_modified FOREIGN KEY (modified_by) REFERENCES users_master(id),
    CONSTRAINT fk_parents_deleted  FOREIGN KEY (deleted_by)  REFERENCES users_master(id)
);

COMMENT ON COLUMN student_parents_master.id                  IS 'Primary key, auto-incremented unique identifier';
COMMENT ON COLUMN student_parents_master.st_id               IS 'Foreign key referencing the student this parent/guardian belongs to';
COMMENT ON COLUMN student_parents_master.relation_id         IS 'Foreign key referencing relation type (e.g. Father, Mother, Guardian)';
COMMENT ON COLUMN student_parents_master.title               IS 'Salutation or title (e.g. Mr, Mrs, Dr)';
COMMENT ON COLUMN student_parents_master.first_name          IS 'First name of the parent or guardian';
COMMENT ON COLUMN student_parents_master.middle_name         IS 'Middle name of the parent or guardian (optional)';
COMMENT ON COLUMN student_parents_master.last_name           IS 'Last name / surname of the parent or guardian';
COMMENT ON COLUMN student_parents_master.gender_id           IS 'Foreign key referencing gender_master';
COMMENT ON COLUMN student_parents_master.mobile_no           IS 'Mobile contact number of the parent or guardian';
COMMENT ON COLUMN student_parents_master.email_id            IS 'Email address of the parent or guardian';
COMMENT ON COLUMN student_parents_master.is_primary_guardian IS '1: primary guardian, 0: not primary';
COMMENT ON COLUMN student_parents_master.is_active           IS '2: deleted, 1: active, 0: inactive';
COMMENT ON COLUMN student_parents_master.created_by          IS 'ID of the user who created this record';
COMMENT ON COLUMN student_parents_master.created_date        IS 'Timestamp when this record was created';
COMMENT ON COLUMN student_parents_master.modified_by         IS 'ID of the user who last modified this record';
COMMENT ON COLUMN student_parents_master.modified_date       IS 'Timestamp when this record was last modified';
COMMENT ON COLUMN student_parents_master.deleted_by          IS 'ID of the user who soft-deleted this record';
COMMENT ON COLUMN student_parents_master.deleted_date        IS 'Timestamp when this record was soft-deleted';


CREATE TABLE student_document (
    id               SERIAL       PRIMARY KEY,
    st_id            INT          NOT NULL,
    emp_id           INTEGER,
    document_type_id INT          NOT NULL,
    document_no      VARCHAR(100),
    attachment       VARCHAR(255),
    is_active        SMALLINT     DEFAULT 1,
    created_by       INTEGER      NOT NULL,
    created_date     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    modified_by      INTEGER,
    modified_date    TIMESTAMP,
    deleted_by       INTEGER,
    deleted_date     TIMESTAMP,
    CONSTRAINT fk_doc_student  FOREIGN KEY (st_id)      REFERENCES student_master(id),
    CONSTRAINT fk_doc_employee FOREIGN KEY (emp_id)     REFERENCES users_master(id),
    CONSTRAINT fk_doc_created  FOREIGN KEY (created_by) REFERENCES users_master(id),
    CONSTRAINT fk_doc_modified FOREIGN KEY (modified_by) REFERENCES users_master(id),
    CONSTRAINT fk_doc_deleted  FOREIGN KEY (deleted_by)  REFERENCES users_master(id)
);

COMMENT ON COLUMN student_document.id               IS 'Primary key, auto-incremented unique identifier';
COMMENT ON COLUMN student_document.st_id            IS 'Foreign key referencing the student this document belongs to';
COMMENT ON COLUMN student_document.emp_id           IS 'Foreign key referencing the employee if document is employee-linked';
COMMENT ON COLUMN student_document.document_type_id IS 'Foreign key referencing document type (e.g. Aadhaar, Birth Certificate)';
COMMENT ON COLUMN student_document.document_no      IS 'Document number or identifier (e.g. Aadhaar number)';
COMMENT ON COLUMN student_document.attachment       IS 'File path or URL to the uploaded document attachment';
COMMENT ON COLUMN student_document.is_active        IS '2: deleted, 1: active, 0: inactive';
COMMENT ON COLUMN student_document.created_by       IS 'ID of the user who created this record';
COMMENT ON COLUMN student_document.created_date     IS 'Timestamp when this record was created';
COMMENT ON COLUMN student_document.modified_by      IS 'ID of the user who last modified this record';
COMMENT ON COLUMN student_document.modified_date    IS 'Timestamp when this record was last modified';
COMMENT ON COLUMN student_document.deleted_by       IS 'ID of the user who soft-deleted this record';
COMMENT ON COLUMN student_document.deleted_date     IS 'Timestamp when this record was soft-deleted';