CREATE TABLE leave_type_master (
    id SERIAL PRIMARY KEY,
    leave_code VARCHAR(20) NOT NULL,
    leave_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color_code VARCHAR(7),  -- e.g., #FF5733
    yearly_limit NUMERIC(5,1),
    carry_forward INTEGER DEFAULT 0,  -- 0 = No, 1 = Yes
    status SMALLINT DEFAULT 1,  -- 1 = Active, 0 = Inactive
    created_by INT NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT REFERENCES users_master(id),
    updated_date TIMESTAMP,
    deleted_by INT REFERENCES users_master(id),
    deleted_date TIMESTAMP
);
COMMENT ON TABLE leave_type_master IS 'Stores different types of leaves available in the organization.';
COMMENT ON COLUMN leave_type_master.id IS 'Primary key of the leave type.';
COMMENT ON COLUMN leave_type_master.leave_code IS 'Short unique code for the leave type (e.g., CL, SL).';
COMMENT ON COLUMN leave_type_master.leave_name IS 'Full name of the leave type (e.g., Casual Leave).';
COMMENT ON COLUMN leave_type_master.description IS 'Detailed description of the leave type.';
COMMENT ON COLUMN leave_type_master.icon IS 'Icon representing the leave type.';
COMMENT ON COLUMN leave_type_master.color_code IS 'Color associated with the leave type.';
COMMENT ON COLUMN leave_type_master.status IS '1 = Active, 0 = Inactive';
COMMENT ON COLUMN leave_type_master.created_by IS 'User who created the record.';
COMMENT ON COLUMN leave_type_master.created_date IS 'Date and time when the record was created.';
COMMENT ON COLUMN leave_type_master.updated_by IS 'User who last updated the record.';
COMMENT ON COLUMN leave_type_master.updated_date IS 'Date and time when the record was last updated.';
COMMENT ON COLUMN leave_type_master.deleted_by IS 'User who deleted the record.';
COMMENT ON COLUMN leave_type_master.deleted_date IS 'Date and time when the record was deleted.';
COMMENT ON COLUMN leave_type_master.yearly_limit IS 'Maximum leave balance allowed per year';
COMMENT ON COLUMN leave_type_master.carry_forward IS 'Indicates whether unused leave can be carried forward to the next year';
CREATE INDEX idx_leave_type_code ON leave_type_master(leave_code);
CREATE INDEX idx_leave_type_name ON leave_type_master(leave_name);
CREATE INDEX idx_leave_type_status ON leave_type_master(status);
CREATE INDEX idx_leave_type_created_by ON leave_type_master(created_by);
CREATE INDEX idx_leave_type_updated_by ON leave_type_master(updated_by);
CREATE INDEX idx_leave_type_deleted_by ON leave_type_master(deleted_by);

-- Sample Data
INSERT INTO leave_type_master (leave_code,leave_name,description,yearly_limit,carry_forward,status,created_by,icon,color_code) VALUES
('CL',  'Casual Leave',          'Leave for personal work or emergencies.',                     12, 0, 1, 1, 'pi pi-sun', '#378ADD'),
('SL',  'Sick Leave',            'Leave for illness, injury, or medical treatment.',            12, 0, 1, 1, 'pi pi-heart', '#FF6B6B'),
('PL',  'Paid Leave',            'General paid leave available to users.',                  18, 1, 1, 1, 'pi pi-briefcase', '#4ECDC4'),
('ML',  'Maternity Leave',       'Leave granted to female users for childbirth.',          180, 0, 1, 1, 'pi pi-user', '#FF9AA2'),
('PTL', 'Paternity Leave',       'Leave granted to fathers during childbirth.',                  15, 0, 1, 1, 'pi pi-user', '#C7F464'),
('AL',  'Adoption Leave',        'Leave granted to adoptive parents.',                           30, 0, 1, 1, 'pi pi-user', '#FFB3BA'),
('PLD', 'Parental Leave',        'Leave for parents to care for their children.',                30, 0, 1, 1, 'pi pi-user', '#A2C9F0'),
('EL',  'Earned Leave',          'Leave earned based on service period.',                        24, 1, 1, 1, 'pi pi-calendar', '#F7DC6F'),
('LOP', 'Leave Without Pay',     'Unpaid leave when paid leave balance is exhausted.',            0, 0, 1, 1, 'pi pi-ban', '#888888'),
('HPL', 'Half Pay Leave',        'Leave granted with 50 percent salary.',                        20, 1, 1, 1, 'pi pi-percentage', '#FFD93D'),
('CPL', 'Compensatory Leave',    'Leave earned for working on holidays or weekends.',            10, 0, 1, 1, 'pi pi-clock', '#B5EAD7'),
('VL',  'Vacation Leave',        'Leave for vacation and personal travel.',                      15, 1, 1, 1, 'pi pi-plane', '#50C878'),
('BL',  'Bereavement Leave',     'Leave due to death of an immediate family member.',             5, 0, 1, 1, 'pi pi-user', '#808080'),
('RL',  'Religious Leave',       'Leave for religious observances and festivals.',                3, 0, 1, 1, 'pi pi-pray', '#FFA500'),
('MIL', 'Military Leave',        'Leave for military duties or training.',                        30, 0, 1, 1, 'pi pi-shield', '#FF4500'),
('SBL', 'Sabbatical Leave',      'Extended leave for research or professional development.',     90, 0, 1, 1, 'pi pi-book', '#9370DB'),
('SLD', 'Study Leave',           'Leave for educational purposes or skill development.',         30, 0, 1, 1, 'pi pi-graduation-cap', '#20B2AA');


CREATE TABLE user_leave_balance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users_master(id),
    leave_type_id INTEGER NOT NULL REFERENCES leave_type_master(id),
    year INTEGER,
    allocated_days NUMERIC(5,1),
    used_days NUMERIC(5,1) DEFAULT 0,
    remaining_days NUMERIC(5,1),
    carry_forward_days NUMERIC(5,1) DEFAULT 0,
    status INT DEFAULT 1,  -- 1 = Active, 0 = Inactive
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users_master(id),
    updated_date TIMESTAMP,
    deleted_by INTEGER REFERENCES users_master(id),
    deleted_date TIMESTAMP
);
COMMENT ON TABLE user_leave_balance IS 'Stores the leave balance for each user and leave type.';
COMMENT ON COLUMN user_leave_balance.id IS 'Primary key of the user_leave_balance table.';
COMMENT ON COLUMN user_leave_balance.user_id IS 'ID of the user, references users_master.';
COMMENT ON COLUMN user_leave_balance.leave_type_id IS 'ID of the leave type, references leave_type_master.';
COMMENT ON COLUMN user_leave_balance.year IS 'Year for which the leave balance is applicable.';
COMMENT ON COLUMN user_leave_balance.allocated_days IS 'Total leave days allocated for the year.';
COMMENT ON COLUMN user_leave_balance.used_days IS 'Total leave days used by the user.';
COMMENT ON COLUMN user_leave_balance.remaining_days IS 'Total leave days remaining for the user.';
COMMENT ON COLUMN user_leave_balance.carry_forward_days IS 'Leave days carried forward from the previous year.';
COMMENT ON COLUMN user_leave_balance.status IS '1 = Active, 0 = Inactive';
COMMENT ON COLUMN user_leave_balance.created_by IS 'User who created the record.';
COMMENT ON COLUMN user_leave_balance.created_date IS 'Date and time when the record was created.';
COMMENT ON COLUMN user_leave_balance.updated_by IS 'User who last updated the record.';
COMMENT ON COLUMN user_leave_balance.updated_date IS 'Date and time when the record was last updated.';
COMMENT ON COLUMN user_leave_balance.deleted_by IS 'User who deleted the record.';
COMMENT ON COLUMN user_leave_balance.deleted_date IS 'Date and time when the record was deleted.';
CREATE INDEX idx_user_leave_balance_user_id ON user_leave_balance(user_id);
CREATE INDEX idx_user_leave_balance_leave_type_id ON user_leave_balance(leave_type_id);
CREATE INDEX idx_user_leave_balance_year ON user_leave_balance(year);
CREATE INDEX idx_user_leave_balance_status ON user_leave_balance(status);
CREATE INDEX idx_user_leave_balance_created_by ON user_leave_balance(created_by);
CREATE INDEX idx_user_leave_balance_updated_by ON user_leave_balance(updated_by);
CREATE INDEX idx_user_leave_balance_deleted_by ON user_leave_balance(deleted_by);

CREATE TABLE users_leave_details (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users_master(id),
    leave_type_id INT NOT NULL REFERENCES leave_type_master(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC(5,2) NOT NULL,  -- supports half-day, quarter-day etc.
    reason TEXT,
    status INTEGER DEFAULT 0,         -- 0 = Pending, 1 = Approved, 2 = Rejected, 3 = deleted
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER REFERENCES users_master(id),
    approved_date TIMESTAMP,
    rejected_by INTEGER REFERENCES users_master(id),
    rejected_date TIMESTAMP,
    cancelled_by INTEGER REFERENCES users_master(id),
    cancelled_date TIMESTAMP,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users_master(id),
    updated_date TIMESTAMP,
    deleted_by INTEGER REFERENCES users_master(id),
    deleted_date TIMESTAMP
);
COMMENT ON TABLE users_leave_details IS 'Stores leave applications submitted by users.';

COMMENT ON COLUMN users_leave_details.id IS 'Primary key of the users_leave_details table.';
COMMENT ON COLUMN users_leave_details.user_id IS 'user who applied for the leave.';
COMMENT ON COLUMN users_leave_details.leave_type_id IS 'Type of leave applied, references leave_type_master.';
COMMENT ON COLUMN users_leave_details.start_date IS 'Start date of the leave.';
COMMENT ON COLUMN users_leave_details.end_date IS 'End date of the leave.';
COMMENT ON COLUMN users_leave_details.total_days IS 'Total number of leave days applied.';
COMMENT ON COLUMN users_leave_details.reason IS 'Reason provided by the user for the leave.';
COMMENT ON COLUMN users_leave_details.status IS '0 = Pending, 1 = Approved, 2 = Rejected, 3 = deleted.';
COMMENT ON COLUMN users_leave_details.applied_date IS 'Date and time when the leave was applied.';
COMMENT ON COLUMN users_leave_details.approved_by IS 'User who approved the leave.';
COMMENT ON COLUMN users_leave_details.approved_date IS 'Date and time when the leave was approved.';
COMMENT ON COLUMN users_leave_details.rejected_by IS 'User who rejected the leave.';
COMMENT ON COLUMN users_leave_details.rejected_date IS 'Date and time when the leave was rejected.';
COMMENT ON COLUMN users_leave_details.cancelled_by IS 'User who cancelled the leave.';
COMMENT ON COLUMN users_leave_details.cancelled_date IS 'Date and time when the leave was cancelled.';
COMMENT ON COLUMN users_leave_details.created_by IS 'User who created the record.';
COMMENT ON COLUMN users_leave_details.created_date IS 'Timestamp when the record was created.';
COMMENT ON COLUMN users_leave_details.updated_by IS 'User who last updated the record.';
COMMENT ON COLUMN users_leave_details.updated_date IS 'Timestamp when the record was last updated.';
COMMENT ON COLUMN users_leave_details.deleted_by IS 'User who deleted the record.';
COMMENT ON COLUMN users_leave_details.deleted_date IS 'Timestamp when the record was deleted.';

CREATE INDEX idx_users_leave_details_user_id ON users_leave_details(user_id);
CREATE INDEX idx_users_leave_details_leave_type_id ON users_leave_details(leave_type_id);
CREATE INDEX idx_users_leave_details_status ON users_leave_details(status);
CREATE INDEX idx_users_leave_details_start_end_date ON users_leave_details(start_date, end_date);
CREATE INDEX idx_users_leave_details_created_by ON users_leave_details(created_by);
CREATE INDEX idx_users_leave_details_updated_by ON users_leave_details(updated_by);
CREATE INDEX idx_users_leave_details_deleted_by ON users_leave_details(deleted_by);