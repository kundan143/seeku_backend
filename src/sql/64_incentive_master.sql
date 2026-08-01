-- Incentive scheme master: defines incentive types/amounts, optionally scoped to specific
-- departments, designations, and/or employees (a NULL/empty array means "applies to all").
-- The incentive type is a dropdown-master-driven value (dropdown_value_master.id) so business
-- users can manage the taxonomy themselves via Developer Tools > Dropdown Master, mirroring
-- how material_master.material_category_id works. The applicability scopes use INTEGER[]
-- columns, mirroring the company_news.department_ids multi-select pattern.
CREATE TABLE IF NOT EXISTS incentive_master (
  id BIGSERIAL PRIMARY KEY,
  incentive_name VARCHAR(255) NOT NULL,
  incentive_type_id INTEGER NOT NULL REFERENCES dropdown_value_master(id),
  value_type VARCHAR(20) NOT NULL DEFAULT 'flat' CHECK (value_type IN ('flat', 'percentage')),
  incentive_value NUMERIC(12, 2) NOT NULL,
  department_id INTEGER REFERENCES department_master(id),
  employee_id INTEGER REFERENCES users_master(id),
  effective_from DATE NOT NULL,
  effective_to DATE,
  description TEXT,
  status INTEGER NOT NULL DEFAULT 1,
  created_by INTEGER NOT NULL REFERENCES users_master(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_by INTEGER REFERENCES users_master(id),
  modified_date TIMESTAMP,
  deleted_by INTEGER REFERENCES users_master(id),
  deleted_date TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_incentive_master_status ON incentive_master(status);

COMMENT ON TABLE incentive_master IS 'Incentive scheme definitions (name, type, value, applicability, effective dates).';
COMMENT ON COLUMN incentive_master.incentive_name IS 'Display name of the incentive scheme';
COMMENT ON COLUMN incentive_master.incentive_type_id IS 'References dropdown_value_master.id - the incentive type value chosen via Dropdown Master';
COMMENT ON COLUMN incentive_master.value_type IS 'How incentive_value should be interpreted: flat amount or percentage';
COMMENT ON COLUMN incentive_master.incentive_value IS 'Flat amount (currency) or percentage value, per value_type';
COMMENT ON COLUMN incentive_master.department_id IS 'Scope target - references department_master.id; NULL = all departments';
COMMENT ON COLUMN incentive_master.employee_id IS 'Scope target - references users_master.id; NULL = all employees (within department scope)';
COMMENT ON COLUMN incentive_master.effective_from IS 'Date the incentive scheme becomes active';
COMMENT ON COLUMN incentive_master.effective_to IS 'Date the incentive scheme ends (nullable = open-ended)';
COMMENT ON COLUMN incentive_master.status IS '1 = Active, 0 = Deleted (soft delete)';
