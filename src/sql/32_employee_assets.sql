CREATE TABLE employee_assets (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER NOT NULL REFERENCES asset_master(id),
  user_id INTEGER NOT NULL REFERENCES users_master(id),
  assigned_date DATE NOT NULL,
  returned_date DATE,
  remarks TEXT,
  status INTEGER NOT NULL DEFAULT 1,
  is_deleted INTEGER DEFAULT 0,
  created_by INTEGER NOT NULL REFERENCES users_master(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_by INTEGER REFERENCES users_master(id),
  modified_date TIMESTAMP
);

-- Column comments
COMMENT ON COLUMN employee_assets.id IS 'Primary key - Unique ID for each assignment record';
COMMENT ON COLUMN employee_assets.asset_id IS 'Reference to the asset being assigned (asset_master.id)';
COMMENT ON COLUMN employee_assets.user_id IS 'Employee the asset is assigned to (users_master.id)';
COMMENT ON COLUMN employee_assets.assigned_date IS 'Date the asset was handed over to the employee';
COMMENT ON COLUMN employee_assets.returned_date IS 'Date the asset was returned; NULL while still assigned';
COMMENT ON COLUMN employee_assets.remarks IS 'Notes recorded at assignment or return time (condition, reason, etc.)';
COMMENT ON COLUMN employee_assets.status IS 'Assignment status (1 = Currently Assigned, 0 = Returned)';
COMMENT ON COLUMN employee_assets.is_deleted IS 'Soft delete flag (0 = Active, 1 = Deleted)';
COMMENT ON COLUMN employee_assets.created_by IS 'User ID who created the record (references users_master.id)';
COMMENT ON COLUMN employee_assets.created_date IS 'Timestamp when the record was created';
COMMENT ON COLUMN employee_assets.modified_by IS 'User ID who last modified the record (references users_master.id)';
COMMENT ON COLUMN employee_assets.modified_date IS 'Timestamp when the record was last modified';

-- Table comment
COMMENT ON TABLE employee_assets IS 'Assignment history of company assets (asset_master) to employees - one row per assignment, closed out via status/returned_date when the asset comes back';

CREATE INDEX idx_employee_assets_asset_id ON employee_assets(asset_id);
CREATE INDEX idx_employee_assets_user_id ON employee_assets(user_id);
CREATE INDEX idx_employee_assets_status ON employee_assets(status);
CREATE INDEX idx_employee_assets_is_deleted ON employee_assets(is_deleted);

-- An asset can only be actively assigned to one employee at a time
CREATE UNIQUE INDEX uq_employee_assets_active_asset ON employee_assets(asset_id) WHERE status = 1 AND is_deleted = 0;
