CREATE TABLE stage_master (
  id             SERIAL PRIMARY KEY,
  stage_name     VARCHAR(100) NOT NULL,
  color_code     VARCHAR(7) NOT NULL,
  status DOUBLE PRECISION DEFAULT 0,  -- 1- Active / 0-Inactive
  created_by     INTEGER NOT NULL REFERENCES users_master(id),
  created_date   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_by    INTEGER REFERENCES users_master(id),
  modified_date  TIMESTAMP
);
INSERT INTO stage_master (id, stage_name, color_code, status, created_by, created_date) VALUES
-- Intake
(1,  'Lead Created',           '#0EA5E9', 1, 1, CURRENT_TIMESTAMP),  -- sky blue
(2,  'Enquiry Received',       '#0F766E', 1, 1, CURRENT_TIMESTAMP),  -- teal
(3,  'Assigned',               '#059669', 1, 1, CURRENT_TIMESTAMP),  -- emerald
(4,  'Contacted',              '#65A30D', 1, 1, CURRENT_TIMESTAMP),  -- lime
(5,  'Requirement Discussion', '#4D7C0F', 1, 1, CURRENT_TIMESTAMP),  -- olive

-- Quotation
(6,  'Technical Feasibility',  '#CA8A04', 1, 1, CURRENT_TIMESTAMP),  -- gold
(7,  'Preparing Quotation',    '#D97706', 1, 1, CURRENT_TIMESTAMP),  -- amber
(8,  'Quotation Approval',     '#EA580C', 1, 1, CURRENT_TIMESTAMP),  -- orange
(9,  'Quotation Sent',         '#C2410C', 1, 1, CURRENT_TIMESTAMP),  -- burnt orange
(10, 'Customer Follow-up',     '#B45309', 1, 1, CURRENT_TIMESTAMP),  -- bronze

-- Decision
(11, 'Won',                    '#15803D', 1, 1, CURRENT_TIMESTAMP),  -- green (semantic: success)
(12, 'Lost',                   '#B91C1C', 1, 1, CURRENT_TIMESTAMP),  -- red (semantic: failure)
(13, 'Needs Revision',         '#F59E0B', 1, 1, CURRENT_TIMESTAMP),  -- amber (semantic: caution)

-- Fulfillment
(14, 'Sales Order',            '#6D28D9', 1, 1, CURRENT_TIMESTAMP),  -- violet
(15, 'Production Planning',    '#7C3AED', 1, 1, CURRENT_TIMESTAMP),  -- purple
(16, 'Invoice',                '#9333EA', 1, 1, CURRENT_TIMESTAMP),  -- deep magenta
(17, 'Delivery',                '#C026D3', 1, 1, CURRENT_TIMESTAMP);  -- fuchsia

CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    lead_date DATE NOT NULL,
    due_date DATE NOT NULL,
    source_id INTEGER NOT NULL,
    lead_type_id INTEGER NOT NULL,
    lead_kind_id INTEGER NOT NULL,
    stage_id INTEGER NOT NULL REFERENCES stage_master(id) DEFAULT 1,
    org_id INTEGER NOT NULL REFERENCES organizations_master(id),
    email TEXT[] NOT NULL DEFAULT '{}',
    phone TEXT[] NOT NULL DEFAULT '{}',
    enquiry_details TEXT[] NOT NULL DEFAULT '{}',
    lead_documents TEXT[] DEFAULT '{}',
    assigned_to INTEGER REFERENCES users_master(id),
    estimated_value DOUBLE PRECISION,
    status DOUBLE PRECISION NOT NULL DEFAULT 1,
    is_deleted DOUBLE PRECISION DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP WITHOUT TIME ZONE
);

-- Table comment
COMMENT ON TABLE leads IS 'Stores sales lead / enquiry details captured before conversion to a sales order';

-- Column comments
COMMENT ON COLUMN leads.id IS 'Unique lead identifier (Primary Key)';
COMMENT ON COLUMN leads.lead_date IS 'Date the lead was generated';
COMMENT ON COLUMN leads.due_date IS 'Date by which the lead must be actioned';
COMMENT ON COLUMN leads.source_id IS 'Lead source - maps to the static Source list defined in the frontend (Website, Referral, Cold Call, etc.), not a master table';
COMMENT ON COLUMN leads.lead_type_id IS 'Type of order - maps to the static Type list defined in the frontend (Budget, Regular, Simple), not a master table';
COMMENT ON COLUMN leads.lead_kind_id IS 'Kind of inquiry - maps to the static Kind list defined in the frontend (Price, Price + TDS, etc.), not a master table';
COMMENT ON COLUMN leads.stage_id IS 'Current pipeline stage - references stage_master (Lead Created, Contacted, Won, etc.)';
COMMENT ON COLUMN leads.org_id IS 'Reference to the organization (buyer) this lead is for';
COMMENT ON COLUMN leads.assigned_to IS 'Sales executive assigned to this lead';
COMMENT ON COLUMN leads.estimated_value IS 'Rough estimated deal value at lead stage';
COMMENT ON COLUMN leads.email IS 'Contact email address(es) for the lead';
COMMENT ON COLUMN leads.phone IS 'Contact phone number(s) for the lead';
COMMENT ON COLUMN leads.enquiry_details IS 'List of free-text points describing what the lead requires';
COMMENT ON COLUMN leads.lead_documents IS 'Uploaded attachment file paths (PDF/Excel/Word) for the lead';
COMMENT ON COLUMN leads.status IS 'Lead status flag (1 = Active, 0 = Inactive)';
COMMENT ON COLUMN leads.is_deleted IS 'Soft delete flag (0 = Active, 1 = Deleted)';
COMMENT ON COLUMN leads.created_by IS 'User who created the record';
COMMENT ON COLUMN leads.created_date IS 'Timestamp when record was created';
COMMENT ON COLUMN leads.modified_by IS 'User who last modified the record';
COMMENT ON COLUMN leads.modified_date IS 'Timestamp when record was last modified';

-- Indexes for performance
CREATE INDEX idx_leads_org_id ON leads(org_id);
CREATE INDEX idx_leads_source_id ON leads(source_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_stage_id ON leads(stage_id);
CREATE INDEX idx_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_estimated_value ON leads(estimated_value);
CREATE INDEX idx_leads_is_deleted ON leads(is_deleted);
CREATE INDEX idx_leads_created_by ON leads(created_by);


create table if not exists lead_tracking_log (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id),
    stage_id INTEGER NOT NULL REFERENCES stage_master(id),
    status DOUBLE PRECISION NOT NULL DEFAULT 1,
    is_deleted DOUBLE PRECISION DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP WITHOUT TIME ZONE
);

comment on table lead_tracking_log is 'Stores the history of stage changes for each lead, allowing tracking of the lead''s progress through the sales pipeline';

comment on column lead_tracking_log.id is 'Unique identifier for each log entry (Primary Key)';
comment on column lead_tracking_log.lead_id is 'Reference to the lead for which this log entry is recorded';
comment on column lead_tracking_log.stage_id is 'Reference to the stage that the lead was moved to at this point in time';
comment on column lead_tracking_log.status is 'Log entry status flag (1 = Active, 0 = Inactive)';
comment on column lead_tracking_log.is_deleted is 'Soft delete flag (0 = Active, 1 = Deleted)';
comment on column lead_tracking_log.created_by is 'User who created the log entry';
comment on column lead_tracking_log.created_date is 'Timestamp when the log entry was created';
comment on column lead_tracking_log.modified_by is 'User who last modified the log entry';
comment on column lead_tracking_log.modified_date is 'Timestamp when the log entry was last modified';  
