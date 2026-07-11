CREATE TABLE IF NOT EXISTS dropdown_value_master (
    id BIGSERIAL PRIMARY KEY,
    field_id INTEGER NOT NULL REFERENCES dropdown_master(id),
    field_value VARCHAR(255) NOT NULL,
    status DOUBLE PRECISION DEFAULT 0,
    is_deleted DOUBLE PRECISION DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP,
    deleted_by INTEGER REFERENCES users_master(id),
    deleted_date TIMESTAMP
);

COMMENT ON TABLE dropdown_value_master IS 'Stores the actual selectable values for each dropdown field defined in dropdown_master';

COMMENT ON COLUMN dropdown_value_master.id IS 'Unique identifier for each dropdown value entry (Primary Key)';
COMMENT ON COLUMN dropdown_value_master.field_id IS 'Reference to the dropdown field (dropdown_master) this value belongs to';
COMMENT ON COLUMN dropdown_value_master.field_value IS 'The actual selectable value/option for the dropdown field';
COMMENT ON COLUMN dropdown_value_master.status IS 'Row status flag (1 = Active, 0 = Inactive)';
COMMENT ON COLUMN dropdown_value_master.is_deleted IS 'Soft delete flag (0 = Active, 1 = Deleted)';
COMMENT ON COLUMN dropdown_value_master.created_by IS 'User who created the record';
COMMENT ON COLUMN dropdown_value_master.created_date IS 'Timestamp when the record was created';
COMMENT ON COLUMN dropdown_value_master.modified_by IS 'User who last modified the record';
COMMENT ON COLUMN dropdown_value_master.modified_date IS 'Timestamp when the record was last modified';
COMMENT ON COLUMN dropdown_value_master.deleted_by IS 'User who soft-deleted the record';
COMMENT ON COLUMN dropdown_value_master.deleted_date IS 'Timestamp when the record was soft-deleted';

CREATE INDEX idx_dropdown_value_master_field_id ON dropdown_value_master(field_id);
CREATE INDEX idx_dropdown_value_master_is_deleted ON dropdown_value_master(is_deleted);
