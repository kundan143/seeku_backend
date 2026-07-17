CREATE SEQUENCE IF NOT EXISTS asset_code_seq START WITH 1;

CREATE TABLE asset_master (
  id SERIAL PRIMARY KEY,
  asset_name_id INTEGER NOT NULL REFERENCES dropdown_value_master(id),
  asset_code VARCHAR(100) NOT NULL UNIQUE,
  category_id INTEGER NOT NULL REFERENCES dropdown_value_master(id),
  serial_number VARCHAR(255) UNIQUE,
  brand_model_id INTEGER REFERENCES dropdown_value_master(id),
  specifications TEXT,
  location VARCHAR(255),
  asset_condition INTEGER DEFAULT 1,
  invoice_number VARCHAR(255),
  remarks TEXT,
  purchase_date DATE,
  purchase_value NUMERIC(15,2),
  supplier_id INTEGER REFERENCES organizations_master(id),
  warranty_expiry_date DATE,
  status INTEGER DEFAULT 1,
  is_deleted INTEGER DEFAULT 0,
  created_by INTEGER NOT NULL REFERENCES users_master(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_by INTEGER REFERENCES users_master(id),
  modified_date TIMESTAMP,
  deleted_by INTEGER REFERENCES users_master(id),
  deleted_date TIMESTAMP
);

-- Column comments
COMMENT ON COLUMN asset_master.id IS 'Primary key - Unique ID for each asset';
COMMENT ON COLUMN asset_master.asset_name_id IS 'Asset name - references dropdown_value_master(id), configured via Developer Tools > Dropdown Master ("Asset Name" field)';
COMMENT ON COLUMN asset_master.asset_code IS 'Unique asset tag/code, auto-generated from asset_code_seq (e.g. AST-000001)';
COMMENT ON COLUMN asset_master.category_id IS 'Asset category - references dropdown_value_master(id), configured via Developer Tools > Dropdown Master ("Asset Category" field)';
COMMENT ON COLUMN asset_master.serial_number IS 'Manufacturer serial number of the physical unit';
COMMENT ON COLUMN asset_master.brand_model_id IS 'Brand/Model - references dropdown_value_master(id), configured via Developer Tools > Dropdown Master ("Asset Brand/Model" field)';
COMMENT ON COLUMN asset_master.specifications IS 'Free-text specifications (e.g. RAM, CPU, storage)';
COMMENT ON COLUMN asset_master.location IS 'Physical location/branch where the asset is kept';
COMMENT ON COLUMN asset_master.asset_condition IS 'Condition of the asset (1 = New, 2 = Good, 3 = Damaged, 4 = Retired)';
COMMENT ON COLUMN asset_master.invoice_number IS 'Purchase invoice/bill number';
COMMENT ON COLUMN asset_master.remarks IS 'Free-text notes about the asset';
COMMENT ON COLUMN asset_master.purchase_date IS 'Date the asset was purchased';
COMMENT ON COLUMN asset_master.purchase_value IS 'Purchase value/cost of the asset';
COMMENT ON COLUMN asset_master.supplier_id IS 'Supplier the asset was purchased from - references organizations_master(id)';
COMMENT ON COLUMN asset_master.warranty_expiry_date IS 'Date the asset warranty expires';
COMMENT ON COLUMN asset_master.status IS 'Status indicator (1 = Active, 0 = Inactive)';
COMMENT ON COLUMN asset_master.is_deleted IS 'Soft delete flag (0 = Active, 1 = Deleted)';
COMMENT ON COLUMN asset_master.created_by IS 'User ID who created the record (references users_master.id)';
COMMENT ON COLUMN asset_master.created_date IS 'Timestamp when the record was created';
COMMENT ON COLUMN asset_master.modified_by IS 'User ID who last modified the record (references users_master.id)';
COMMENT ON COLUMN asset_master.modified_date IS 'Timestamp when the record was last modified';
COMMENT ON COLUMN asset_master.deleted_by IS 'User ID who deleted the record (references users_master.id)';
COMMENT ON COLUMN asset_master.deleted_date IS 'Timestamp when the record was deleted';

-- Table comment
COMMENT ON TABLE asset_master IS 'Master table for company assets (laptops, furniture, equipment, etc.) with full audit tracking';

CREATE INDEX idx_asset_master_asset_name_id ON asset_master(asset_name_id);
CREATE INDEX idx_asset_master_category_id ON asset_master(category_id);
CREATE INDEX idx_asset_master_brand_model_id ON asset_master(brand_model_id);
CREATE INDEX idx_asset_master_supplier_id ON asset_master(supplier_id);
CREATE INDEX idx_asset_master_status ON asset_master(status);
CREATE INDEX idx_asset_master_is_deleted ON asset_master(is_deleted);
