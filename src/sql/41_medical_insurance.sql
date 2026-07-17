-- Per-employee medical insurance enrollment records. An employee can have more than one row over
-- time (e.g. policy renewals), mirroring how employee_expense/user_leaves keep a full history.
CREATE TABLE IF NOT EXISTS medical_insurance (
  id BIGSERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES users_master(id),
  insurance_provider VARCHAR(255) NOT NULL,
  policy_number VARCHAR(100) NOT NULL,
  coverage_amount NUMERIC(12, 2),
  valid_from DATE,
  valid_to DATE,
  dependents_details TEXT,
  attachment_url TEXT,
  status INTEGER NOT NULL DEFAULT 1,
  created_by INTEGER NOT NULL REFERENCES users_master(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_by INTEGER REFERENCES users_master(id),
  modified_date TIMESTAMP,
  deleted_by INTEGER REFERENCES users_master(id),
  deleted_date TIMESTAMP
);

COMMENT ON TABLE medical_insurance IS 'Per-employee medical insurance enrollment records (provider, policy, coverage, validity, dependents, policy document).';
COMMENT ON COLUMN medical_insurance.employee_id IS 'Employee this insurance enrollment belongs to (references users_master.id)';
COMMENT ON COLUMN medical_insurance.insurance_provider IS 'Name of the insurance company/provider';
COMMENT ON COLUMN medical_insurance.policy_number IS 'Insurance policy number';
COMMENT ON COLUMN medical_insurance.coverage_amount IS 'Sum insured / coverage amount';
COMMENT ON COLUMN medical_insurance.valid_from IS 'Policy validity start date';
COMMENT ON COLUMN medical_insurance.valid_to IS 'Policy validity end date';
COMMENT ON COLUMN medical_insurance.dependents_details IS 'Free-text list of covered dependents (e.g. Spouse, 1 Child)';
COMMENT ON COLUMN medical_insurance.attachment_url IS 'File path/URL of the uploaded policy document';
COMMENT ON COLUMN medical_insurance.status IS 'Status indicator (1 = Active, 0 = Deleted)';
