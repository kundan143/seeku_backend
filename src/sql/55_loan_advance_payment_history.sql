-- Table creation
CREATE TABLE loan_advance_payment_history (
  id SERIAL PRIMARY KEY,
  loan_advance_request_id INT NOT NULL REFERENCES loan_advance_request(id),
  amount NUMERIC(12,2) NOT NULL,
  remarks TEXT,
  created_by INT NOT NULL REFERENCES users_master(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Column comments
COMMENT ON COLUMN loan_advance_payment_history.id IS 'Primary key - Unique ID for each recorded deduction/payment';
COMMENT ON COLUMN loan_advance_payment_history.loan_advance_request_id IS 'Loan/advance request this payment belongs to (references loan_advance_request.id)';
COMMENT ON COLUMN loan_advance_payment_history.amount IS 'Amount deducted/repaid in this instance';
COMMENT ON COLUMN loan_advance_payment_history.remarks IS 'Optional note about this deduction (e.g. which month''s salary it was deducted from)';
COMMENT ON COLUMN loan_advance_payment_history.created_by IS 'User ID who recorded this payment (references users_master.id)';
COMMENT ON COLUMN loan_advance_payment_history.created_date IS 'Timestamp when this payment was recorded';

-- Table comment
COMMENT ON TABLE loan_advance_payment_history IS 'Ledger of individual deductions/repayments recorded against a loan_advance_request, so total_paid can be traced back to a full history.';
