CREATE TABLE production_datasheet_stages (
    id SERIAL PRIMARY KEY,
    stage_id INTEGER NOT NULL REFERENCES cable_stage_master(id), 
    order_no INTEGER NOT NULL,
    production_datasheet_id INTEGER REFERENCES production_datasheet(id), 
    status INTEGER DEFAULT 0, 
    created_by INTEGER NOT NULL, 
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    modified_by INTEGER, 
    modified_date TIMESTAMP, 
    deleted_by INTEGER, 
    deleted_date TIMESTAMP,
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users_master(id), 
    CONSTRAINT fk_modified_by FOREIGN KEY (modified_by) REFERENCES users_master(id), 
    CONSTRAINT fk_deleted_by FOREIGN KEY (deleted_by) REFERENCES users_master(id) 
);

COMMENT ON COLUMN production_datasheet_stages.id IS 'Primary key, auto-incremented unique identifier';
COMMENT ON COLUMN production_datasheet_stages.stage_id IS 'Reference to cable_stage_master table, identifies the stage';
COMMENT ON COLUMN production_datasheet_stages.order_no IS 'Defines the sequence/order of the stage in the datasheet';
COMMENT ON COLUMN production_datasheet_stages.production_datasheet_id IS 'Reference to production_datasheet table, links stage to datasheet';
COMMENT ON COLUMN production_datasheet_stages.status IS 'Stage status (0: pending, 1: completed, etc.)';
COMMENT ON COLUMN production_datasheet_stages.created_by IS 'ID of the user who created this record';
COMMENT ON COLUMN production_datasheet_stages.created_date IS 'Timestamp when this record was created';
COMMENT ON COLUMN production_datasheet_stages.modified_by IS 'ID of the user who last modified this record';
COMMENT ON COLUMN production_datasheet_stages.modified_date IS 'Timestamp when this record was last modified';
COMMENT ON COLUMN production_datasheet_stages.deleted_by IS 'ID of the user who soft-deleted this record';
COMMENT ON COLUMN production_datasheet_stages.deleted_date IS 'Timestamp when this record was soft-deleted';