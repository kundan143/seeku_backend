CREATE TABLE leave_type_master (
    id SERIAL PRIMARY KEY,
    leave_code VARCHAR(20) NOT NULL,
    leave_name VARCHAR(100) NOT NULL,
    description TEXT,
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
COMMENT ON COLUMN leave_type_master.status IS '1 = Active, 0 = Inactive';
COMMENT ON COLUMN leave_type_master.created_by IS 'User who created the record.';
COMMENT ON COLUMN leave_type_master.created_date IS 'Date and time when the record was created.';
COMMENT ON COLUMN leave_type_master.updated_by IS 'User who last updated the record.';
COMMENT ON COLUMN leave_type_master.updated_date IS 'Date and time when the record was last updated.';
COMMENT ON COLUMN leave_type_master.deleted_by IS 'User who deleted the record.';
COMMENT ON COLUMN leave_type_master.deleted_date IS 'Date and time when the record was deleted.';
CREATE INDEX idx_leave_type_code ON leave_type_master(leave_code);
CREATE INDEX idx_leave_type_name ON leave_type_master(leave_name);
CREATE INDEX idx_leave_type_status ON leave_type_master(status);
CREATE INDEX idx_leave_type_created_by ON leave_type_master(created_by);
CREATE INDEX idx_leave_type_updated_by ON leave_type_master(updated_by);
CREATE INDEX idx_leave_type_deleted_by ON leave_type_master(deleted_by);

-- Sample Data
INSERT INTO leave_type_master (leave_code, leave_name, description, status, created_by) VALUES
('CL', 'Casual Leave', 'Leave for personal reasons or emergencies.', 1, 1),
('SL', 'Sick Leave', 'Leave for health-related issues.', 1, 1),
('PL', 'Paid Leave', 'Leave with pay for various reasons.', 1, 1),
('ML', 'Maternity Leave', 'Leave for childbirth and childcare.', 1, 1),
('PTL', 'Paternity Leave', 'Leave for fathers around the time of childbirth.', 1, 1),
('EL', 'Earned Leave', 'Leave earned based on the duration of service.', 1, 1),
('LOP', 'Leave Without Pay', 'Leave without pay for various reasons.', 1, 1),
('HPL', 'Half Pay Leave', 'Leave with half pay for specific situations.', 1, 1),
('CPL', 'Compensatory Leave', 'Leave granted in lieu of extra work hours.', 1, 1),
('STL', 'Study Leave', 'Leave for educational purposes.', 1, 1),
('VL', 'Vacation Leave', 'Leave for vacations or holidays.', 1, 1),
('BL', 'Bereavement Leave', 'Leave for attending funerals or mourning.', 1, 1),
('RL', 'Religious Leave', 'Leave for religious observances.', 1, 1),
('MIL', 'Military Leave', 'Leave for military service or training.', 1, 1),
('SBL', 'Sabbatical Leave', 'Extended leave for personal or professional development.', 1, 1);

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
COMMENT ON COLUMN users_leave_details.user_id IS 'Employee who applied for the leave.';
COMMENT ON COLUMN users_leave_details.leave_type_id IS 'Type of leave applied, references leave_type_master.';
COMMENT ON COLUMN users_leave_details.start_date IS 'Start date of the leave.';
COMMENT ON COLUMN users_leave_details.end_date IS 'End date of the leave.';
COMMENT ON COLUMN users_leave_details.total_days IS 'Total number of leave days applied.';
COMMENT ON COLUMN users_leave_details.reason IS 'Reason provided by the employee for the leave.';
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