-- Table creation
CREATE TABLE loan_advance_request (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES users_master(id),
  amount NUMERIC(12,2) NOT NULL,
  reason TEXT NOT NULL,
  deduction_months INTEGER NOT NULL,
  monthly_deduction_amount NUMERIC(12,2) GENERATED ALWAYS AS (ROUND(amount / NULLIF(deduction_months, 0), 2)) STORED,
  total_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  attachment_url TEXT,
  status INTEGER DEFAULT 0,
  remarks TEXT,
  created_by INT NOT NULL REFERENCES users_master(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_by INT REFERENCES users_master(id),
  modified_date TIMESTAMP,
  deleted_by INTEGER REFERENCES users_master(id),
  deleted_date TIMESTAMP
);

-- Column comments
COMMENT ON COLUMN loan_advance_request.id IS 'Primary key - Unique ID for each loan/advance request';
COMMENT ON COLUMN loan_advance_request.employee_id IS 'Employee requesting the loan/advance (references users_master.id)';
COMMENT ON COLUMN loan_advance_request.amount IS 'Total loan/advance amount requested';
COMMENT ON COLUMN loan_advance_request.reason IS 'Reason/purpose for the loan or advance';
COMMENT ON COLUMN loan_advance_request.deduction_months IS 'Number of months over which the amount should be deducted from salary';
COMMENT ON COLUMN loan_advance_request.monthly_deduction_amount IS 'Amount to be deducted from salary each month (auto-computed as amount / deduction_months)';
COMMENT ON COLUMN loan_advance_request.total_paid IS 'Cumulative amount repaid so far against this loan/advance';
COMMENT ON COLUMN loan_advance_request.attachment_url IS 'File path or URL for any supporting document';
COMMENT ON COLUMN loan_advance_request.status IS 'Request status: 0 = Pending, 1 = Approved, 2 = Rejected, 3 = Deleted';
COMMENT ON COLUMN loan_advance_request.remarks IS 'HR/manager remarks about the request (e.g. rejection reason)';
COMMENT ON COLUMN loan_advance_request.created_by IS 'User ID who created the record (references users_master.id)';
COMMENT ON COLUMN loan_advance_request.created_date IS 'Timestamp when the record was created';
COMMENT ON COLUMN loan_advance_request.modified_by IS 'User ID who last modified the record (references users_master.id)';
COMMENT ON COLUMN loan_advance_request.modified_date IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN loan_advance_request.deleted_by IS 'User ID who deleted the record (references users_master.id)';
COMMENT ON COLUMN loan_advance_request.deleted_date IS 'Timestamp when the record was deleted';

-- Table comment
COMMENT ON TABLE loan_advance_request IS 'Employee loan/advance requests with amount, reason, deduction schedule, and approval status.';
