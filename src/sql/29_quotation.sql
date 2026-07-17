CREATE TABLE IF NOT EXISTS quotation (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id),
    quotation_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    total_amount NUMERIC(15,2) NOT NULL,
    price_attachment_path TEXT[],
    tds_attachment_path TEXT[],
    fat_attachment_path TEXT[],
    qap_attachment_path TEXT[],
    compliance_attachment_path TEXT[],
    remarks TEXT,
    status DOUBLE PRECISION NOT NULL DEFAULT 1,
    is_deleted DOUBLE PRECISION DEFAULT 0 CHECK (is_deleted IN (0,1)),
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT chk_valid_until_after_quotation_date CHECK (valid_until >= quotation_date)
);

COMMENT ON TABLE quotation IS 'Stores quotations raised against a sales lead, prior to conversion into a sales order';

COMMENT ON COLUMN quotation.id IS 'Unique quotation identifier (Primary Key)';
COMMENT ON COLUMN quotation.lead_id IS 'Reference to the lead this quotation was raised for';
COMMENT ON COLUMN quotation.quotation_date IS 'Date the quotation was raised';
COMMENT ON COLUMN quotation.valid_until IS 'Date until which the quotation remains valid';
COMMENT ON COLUMN quotation.total_amount IS 'Total quoted amount';
COMMENT ON COLUMN quotation.status IS 'Quotation status (1 = Draft, 2 = Sent, 3 = Approved, 4 = Rejected)';
COMMENT ON COLUMN quotation.is_deleted IS 'Soft delete flag (0 = Active, 1 = Deleted)';
COMMENT ON COLUMN quotation.created_by IS 'User who created the record';
COMMENT ON COLUMN quotation.created_date IS 'Timestamp when record was created';
COMMENT ON COLUMN quotation.modified_by IS 'User who last modified the record';
COMMENT ON COLUMN quotation.modified_date IS 'Timestamp when record was last modified';

CREATE INDEX idx_quotation_lead_id ON quotation(lead_id);
CREATE INDEX idx_quotation_status ON quotation(status);
CREATE INDEX idx_quotation_is_deleted ON quotation(is_deleted);
