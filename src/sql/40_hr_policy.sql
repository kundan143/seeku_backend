CREATE TABLE IF NOT EXISTS hr_policy (
  id BIGSERIAL PRIMARY KEY,
  policy_title VARCHAR(255) NOT NULL,
  description TEXT,
  effective_date DATE,
  attachment_url TEXT,
  status INTEGER NOT NULL DEFAULT 1,
  created_by INTEGER NOT NULL REFERENCES users_master(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_by INTEGER REFERENCES users_master(id),
  modified_date TIMESTAMP,
  deleted_by INTEGER REFERENCES users_master(id),
  deleted_date TIMESTAMP
);

COMMENT ON TABLE hr_policy IS 'HR policy documents published for employees to view/download (e.g. leave policy, code of conduct).';
COMMENT ON COLUMN hr_policy.policy_title IS 'Title of the policy document';
COMMENT ON COLUMN hr_policy.description IS 'Summary or notes about the policy';
COMMENT ON COLUMN hr_policy.effective_date IS 'Date the policy takes effect';
COMMENT ON COLUMN hr_policy.attachment_url IS 'File path/URL of the uploaded policy document';
COMMENT ON COLUMN hr_policy.status IS 'Status indicator (1 = Active/Published, 0 = Deleted)';
