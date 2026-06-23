-- ============================================================
--  Table: company_news
--  Description: Stores company news/announcements
-- ============================================================
CREATE TABLE news_type_master (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,              -- Name of the news type (e.g., General, HR, IT)
    description TEXT,                               -- Description of the news type
    status SMALLINT    DEFAULT 1,                       -- 1 = Active, 0 = Inactive
    created_by INT NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,       -- Timestamp when record was created
    modified_by INT REFERENCES users_master(id),
    modified_date TIMESTAMP,                                   -- Timestamp of last update
    deleted_by INT REFERENCES users_master(id),
    deleted_date TIMESTAMP                                    -- Timestamp when record was soft-deleted
);
COMMENT ON TABLE  news_type_master                IS 'Lookup table for types of company news';
COMMENT ON COLUMN news_type_master.id             IS 'Auto-increment primary key';
COMMENT ON COLUMN news_type_master.name           IS 'Unique name of the news type (e.g., General, HR, IT)';
COMMENT ON COLUMN news_type_master.description    IS 'Optional description of the news type';
COMMENT ON COLUMN news_type_master.status         IS '1 = Active, 0 = Inactive';
COMMENT ON COLUMN news_type_master.created_by     IS 'User who created this record (FK → users_master)';
COMMENT ON COLUMN news_type_master.created_date   IS 'Timestamp when record was created';
COMMENT ON COLUMN news_type_master.modified_by     IS 'User who last modified this record (FK → users_master)';
COMMENT ON COLUMN news_type_master.modified_date   IS 'Timestamp of the last modification';
COMMENT ON COLUMN news_type_master.deleted_by     IS 'User who soft-deleted this record (FK → users_master)';
COMMENT ON COLUMN news_type_master.deleted_date   IS 'Timestamp when the record was soft-deleted';

INSERT INTO news_type_master (name, description, status, created_by) VALUES
('General',       'General company-wide announcements',              1, 1),
('HR',            'Human Resources related news and updates',        1, 1),
('IT',            'IT department updates and maintenance notices',   1, 1),
('Finance',       'Finance and payroll related announcements',       1, 1),
('Compliance',    'Regulatory and compliance related updates',       1, 1),
('Event',         'Company events, celebrations and activities',     1, 1),
('Policy Update', 'Changes to company policies and procedures',      1, 1);


CREATE TABLE priority_master (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,               -- Name of the priority level (e.g., High, Medium, Low)
    description TEXT,                               -- Description of the priority level
    status SMALLINT    DEFAULT 1,                       -- 1 = Active, 0 = Inactive
    created_by INT NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,       -- Timestamp when record was created
    modified_by INT REFERENCES users_master(id),
    modified_date TIMESTAMP,                                   -- Timestamp of last update
    deleted_by INT REFERENCES users_master(id),
    deleted_date TIMESTAMP                                    -- Timestamp when record was soft-deleted
);
COMMENT ON TABLE  priority_master                IS 'Lookup table for priority levels of company news';
COMMENT ON COLUMN priority_master.id             IS 'Auto-increment primary key';
COMMENT ON COLUMN priority_master.name           IS 'Unique name of the priority level (e.g., High, Medium, Low)';
COMMENT ON COLUMN priority_master.description    IS 'Optional description of the priority level';
COMMENT ON COLUMN priority_master.status         IS '1 = Active, 0 = Inactive';
COMMENT ON COLUMN priority_master.created_by     IS 'User who created this record (FK → users_master)';
COMMENT ON COLUMN priority_master.created_date   IS 'Timestamp when record was created';
COMMENT ON COLUMN priority_master.modified_by     IS 'User who last modified this record (FK → users_master)';
COMMENT ON COLUMN priority_master.modified_date   IS 'Timestamp of the last modification';
COMMENT ON COLUMN priority_master.deleted_by     IS 'User who soft-deleted this record (FK → users_master)';
COMMENT ON COLUMN priority_master.deleted_date   IS 'Timestamp when the record was soft-deleted';

INSERT INTO priority_master (name, description, status, created_by) VALUES
('Critical',  'Requires immediate attention from all employees',     1, 1),
('High',      'Important news that should be read as soon as possible', 1, 1),
('Medium',    'General priority news for regular attention',         1, 1),
('Low',       'Informational news with no urgency',                  1, 1);
CREATE TABLE company_news (
    id SERIAL PRIMARY KEY,                          -- Auto-increment unique identifier
    news_type_id INT REFERENCES news_type_master(id),
    description TEXT,                                        -- Full content/body of the news
    department_id INT  REFERENCES department_master(id),
    priority_id INT REFERENCES priority_master(id),
    published_date DATE,                                        -- Date when news goes live
    exp_date DATE,                                        -- Expiry date after which news is no longer shown
    attachment TEXT,                                        -- File path or URL of attached document/image
    status SMALLINT    DEFAULT 1,                       -- 1 = Active, 0 = Inactive
    created_by INT NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,       -- Timestamp when record was created
    modified_by INT REFERENCES users_master(id),
    modified_date TIMESTAMP,                                   -- Timestamp of last update
    deleted_by INT REFERENCES users_master(id),
    deleted_date TIMESTAMP                                    -- Timestamp when record was soft-deleted
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- Filter active/inactive news quickly
CREATE INDEX idx_company_news_status ON company_news(status);
-- Filter news by department
CREATE INDEX idx_company_news_department ON company_news(department_id);
-- Filter news by published and expiry date range
CREATE INDEX idx_company_news_dates ON company_news(published_date, exp_date);

-- ── Comments ──────────────────────────────────────────────────────────────────

COMMENT ON TABLE  company_news                IS 'Stores company announcements and news items';
COMMENT ON COLUMN company_news.id             IS 'Auto-increment primary key';
COMMENT ON COLUMN company_news.news_type_id   IS 'Type of news (FK → news_type_master)';
COMMENT ON COLUMN company_news.description    IS 'Full body/content of the news';
COMMENT ON COLUMN company_news.department_id  IS 'Target department for the news (FK → department_master)';
COMMENT ON COLUMN company_news.priority_id    IS 'Priority level of the news (FK → priority_master)';
COMMENT ON COLUMN company_news.published_date IS 'Date from which news is visible to users';
COMMENT ON COLUMN company_news.exp_date       IS 'Date after which news expires and is hidden';
COMMENT ON COLUMN company_news.attachment     IS 'File path or URL for any attached document or image';
COMMENT ON COLUMN company_news.status         IS '1 = Active, 0 = Inactive';
COMMENT ON COLUMN company_news.created_by     IS 'User who created this record (FK → users_master)';
COMMENT ON COLUMN company_news.created_date   IS 'Timestamp when record was created';
COMMENT ON COLUMN company_news.modified_by     IS 'User who last modified this record (FK → users_master)';
COMMENT ON COLUMN company_news.modified_date   IS 'Timestamp of the last modification';
COMMENT ON COLUMN company_news.deleted_by     IS 'User who soft-deleted this record (FK → users_master)';
COMMENT ON COLUMN company_news.deleted_date   IS 'Timestamp when the record was soft-deleted';