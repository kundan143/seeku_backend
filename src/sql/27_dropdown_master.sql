CREATE TABLE IF NOT EXISTS dropdown_master (
    id BIGSERIAL PRIMARY KEY,
    menu_id INTEGER NOT NULL REFERENCES menu_master(id),
    field_name VARCHAR(255) NOT NULL,
    status DOUBLE PRECISION DEFAULT 0,
    is_deleted DOUBLE PRECISION DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP,
    deleted_by INTEGER REFERENCES users_master(id),
    deleted_date TIMESTAMP
);

COMMENT ON TABLE dropdown_master IS 'Stores which fields are configured as dropdowns for each menu';

COMMENT ON COLUMN dropdown_master.id IS 'Unique identifier for each dropdown field entry (Primary Key)';
COMMENT ON COLUMN dropdown_master.menu_id IS 'Reference to the menu (menu_master) this dropdown field belongs to';
COMMENT ON COLUMN dropdown_master.field_name IS 'Name of the field configured as a dropdown for the menu';
COMMENT ON COLUMN dropdown_master.status IS 'Row status flag (1 = Active, 0 = Inactive)';
COMMENT ON COLUMN dropdown_master.is_deleted IS 'Soft delete flag (0 = Active, 1 = Deleted)';
COMMENT ON COLUMN dropdown_master.created_by IS 'User who created the record';
COMMENT ON COLUMN dropdown_master.created_date IS 'Timestamp when the record was created';
COMMENT ON COLUMN dropdown_master.modified_by IS 'User who last modified the record';
COMMENT ON COLUMN dropdown_master.modified_date IS 'Timestamp when the record was last modified';
COMMENT ON COLUMN dropdown_master.deleted_by IS 'User who soft-deleted the record';
COMMENT ON COLUMN dropdown_master.deleted_date IS 'Timestamp when the record was soft-deleted';

CREATE INDEX idx_dropdown_master_menu_id ON dropdown_master(menu_id);
CREATE INDEX idx_dropdown_master_is_deleted ON dropdown_master(is_deleted);
