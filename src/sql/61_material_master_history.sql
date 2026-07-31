CREATE TABLE IF NOT EXISTS material_master_history (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL REFERENCES material_master(id) ON DELETE CASCADE,
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    change_type VARCHAR(20) NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE material_master_history IS 'Field-level change log for material_master - one row per changed field per save, plus a CREATED marker row when the material is first added';

COMMENT ON COLUMN material_master_history.id IS 'Unique identifier for each history entry (Primary Key)';
COMMENT ON COLUMN material_master_history.material_id IS 'Reference to the material this history entry belongs to';
COMMENT ON COLUMN material_master_history.field_name IS 'Name of the material_master column that changed; NULL for CREATED entries';
COMMENT ON COLUMN material_master_history.old_value IS 'Previous value of the field, serialized as text';
COMMENT ON COLUMN material_master_history.new_value IS 'New value of the field, serialized as text';
COMMENT ON COLUMN material_master_history.change_type IS 'CREATED or UPDATED';
COMMENT ON COLUMN material_master_history.created_by IS 'User who made the change';
COMMENT ON COLUMN material_master_history.created_date IS 'Timestamp when the change was recorded';

CREATE INDEX idx_material_master_history_material_id ON material_master_history(material_id);
