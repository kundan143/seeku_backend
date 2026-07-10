CREATE TABLE IF NOT EXISTS lead_history (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id),
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    change_type VARCHAR(20) NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE lead_history IS 'Field-level change log for leads - one row per changed field per save, plus a CREATED marker row when the lead is first added';

COMMENT ON COLUMN lead_history.id IS 'Unique identifier for each history entry (Primary Key)';
COMMENT ON COLUMN lead_history.lead_id IS 'Reference to the lead this history entry belongs to';
COMMENT ON COLUMN lead_history.field_name IS 'Name of the lead column that changed; NULL for CREATED entries';
COMMENT ON COLUMN lead_history.old_value IS 'Previous value of the field, serialized as text (JSON for arrays)';
COMMENT ON COLUMN lead_history.new_value IS 'New value of the field, serialized as text (JSON for arrays)';
COMMENT ON COLUMN lead_history.change_type IS 'CREATED or UPDATED';
COMMENT ON COLUMN lead_history.created_by IS 'User who made the change';
COMMENT ON COLUMN lead_history.created_date IS 'Timestamp when the change was recorded';

CREATE INDEX idx_lead_history_lead_id ON lead_history(lead_id);
