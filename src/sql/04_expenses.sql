-- Table creation
CREATE TABLE expense_type_master (
  id SERIAL PRIMARY KEY,
  expense_type_name VARCHAR(100) NOT NULL,
  expense_type_desc TEXT,
  status INTEGER DEFAULT 1,

  created_by INTEGER NOT NULL REFERENCES users_master(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_by INTEGER REFERENCES users_master(id),
  modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_by INTEGER REFERENCES users_master(id),
  deleted_date TIMESTAMP
);

-- Column comments
COMMENT ON COLUMN expense_type_master.id IS 'Primary key - Unique ID for each expense type';
COMMENT ON COLUMN expense_type_master.expense_type_name IS 'Expense type name (e.g., Travel, Food, Accommodation)';
COMMENT ON COLUMN expense_type_master.expense_type_desc IS 'Detailed description or notes about the expense type';
COMMENT ON COLUMN expense_type_master.status IS 'Status indicator (1 = Active, 0 = Inactive/Deleted)';
COMMENT ON COLUMN expense_type_master.created_by IS 'User ID who created the record (references users_master.id)';
COMMENT ON COLUMN expense_type_master.created_date IS 'Timestamp when the record was created';
COMMENT ON COLUMN expense_type_master.modified_by IS 'User ID who last modified the record (references users_master.id)';
COMMENT ON COLUMN expense_type_master.modified_date IS 'Timestamp when the record was last modified';
COMMENT ON COLUMN expense_type_master.deleted_by IS 'User ID who deleted the record (references users_master.id)';
COMMENT ON COLUMN expense_type_master.deleted_date IS 'Timestamp when the record was deleted';

-- Table comment
COMMENT ON TABLE expense_type_master IS 'Master table for defining types of employee expenses with full audit tracking.';


-- Sample Data
INSERT INTO expense_type_master (expense_type_name, expense_type_desc, created_by)
VALUES
('Travel', 'Travel-related expenses such as flights, taxis, or fuel.', 1),
('Accommodation', 'Hotel, lodging, or stay-related expenses.', 1),
('Food', 'Meals and beverages during official work or travel.', 1),
('Stationery', 'Office supplies such as pens, paper, or notebooks.', 1),
('Client Entertainment', 'Expenses for client meetings or business entertainment.', 1);
-- Employee Expense Table


-- Table creation
CREATE TABLE employee_expense (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES users_master(id),
  expense_type_id INT NOT NULL REFERENCES expense_type_master(id),
  expense_description TEXT,
  amount NUMERIC(12,2) NOT NULL,
  expense_date DATE NOT NULL,
  status INTEGER DEFAULT 0,
  attachment_url TEXT,
  remarks TEXT,

  created_by INT NOT NULL REFERENCES users_master(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_by INT REFERENCES users_master(id),
  modified_date TIMESTAMP,
  deleted_by INTEGER REFERENCES users_master(id),
  deleted_date TIMESTAMP
);

-- Column comments
COMMENT ON COLUMN employee_expense.id IS 'Primary key - Unique ID for each expense record';
COMMENT ON COLUMN employee_expense.employee_id IS 'Employee ID (references users_master.id)';
COMMENT ON COLUMN employee_expense.expense_type_id IS 'Expense type (references expense_type_master.id)';
COMMENT ON COLUMN employee_expense.expense_description IS 'Detailed description or purpose of the expense';
COMMENT ON COLUMN employee_expense.amount IS 'Expense amount (supports up to 9999999999.99)';
COMMENT ON COLUMN employee_expense.expense_date IS 'Date when the expense was incurred';
COMMENT ON COLUMN employee_expense.status IS 'Expense status: 0 = Pending, 1 = Approved, 2 = Rejected, 3 = Deleted';
COMMENT ON COLUMN employee_expense.attachment_url IS 'File path or URL for the attached proof (bill, image, or receipt)';
COMMENT ON COLUMN employee_expense.remarks IS 'Manager or admin remarks about the expense';
COMMENT ON COLUMN employee_expense.created_by IS 'User ID who created the record (references users_master.id)';
COMMENT ON COLUMN employee_expense.created_date IS 'Timestamp when the record was created';
COMMENT ON COLUMN employee_expense.modified_by IS 'User ID who last modified the record (references users_master.id)';
COMMENT ON COLUMN employee_expense.modified_date IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN employee_expense.deleted_by IS 'User ID who deleted the record (references users_master.id)';
COMMENT ON COLUMN employee_expense.deleted_date IS 'Timestamp when the record was deleted';

-- Table comment
COMMENT ON TABLE employee_expense IS 'Stores employee-wise expense entries with type, amount, status, and audit details.';

-- Sample Data
INSERT INTO employee_expense (
  employee_id,
  expense_type_id,
  expense_description,
  amount,
  expense_date,
  status,
  attachment_url,
  remarks,
  created_by
)
VALUES
(1, 1, 'Flight ticket to client site', 12500.00, '2025-10-01', 1, 'https://example.com/receipts/flight1.pdf', 'Approved by manager', 1),
(1, 2, 'Hotel stay during project work', 8200.50, '2025-10-03', 0, 'https://example.com/receipts/hotel2.pdf', 'Pending approval', 1),
(1, 3, 'Team lunch with client', 2450.75, '2025-10-05', 2, 'https://example.com/receipts/lunch3.jpg', 'Rejected - missing invoice', 1),
(1, 4, 'Office stationery purchase', 1200.00, '2025-10-07', 1, 'https://example.com/receipts/stationery.pdf', 'Approved', 1),
(1, 5, 'Client dinner meeting', 4600.00, '2025-10-09', 0, 'https://example.com/receipts/dinner.jpg', 'Waiting for review', 1);
