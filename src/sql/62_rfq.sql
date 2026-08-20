CREATE SEQUENCE IF NOT EXISTS rfq_code_seq START WITH 1;

CREATE TABLE IF NOT EXISTS rfq (
    id SERIAL PRIMARY KEY,
    rfq_number VARCHAR(20) NOT NULL UNIQUE,
    org_id INTEGER NOT NULL REFERENCES organizations_master(id),
    lead_id INTEGER REFERENCES leads(id),
    cable_type VARCHAR(255) NOT NULL,
    cable_standard VARCHAR(100) NOT NULL,
    conductor_size NUMERIC(10,3) NOT NULL,
    no_of_core INTEGER NOT NULL,
    conductor_material VARCHAR(50) NOT NULL,
    insulation_material VARCHAR(50) NOT NULL,
    voltage_grade VARCHAR(100) NOT NULL,
    operating_temperature VARCHAR(50) NOT NULL,
    customer_specification TEXT,
    special_requirement TEXT,
    pd_id INTEGER REFERENCES production_datasheet(id),
    status INTEGER NOT NULL DEFAULT 1,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users_master(id),
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES users_master(id),
    modified_date TIMESTAMP,
    deleted_by INTEGER REFERENCES users_master(id),
    deleted_date TIMESTAMP
);

COMMENT ON TABLE rfq IS 'Customer Request for Quotation intake for the Cable Design & Costing pipeline - basic cable specs entered here later feed an AI-generated design (production_datasheet + child *_information rows) once accepted';
COMMENT ON COLUMN rfq.rfq_number IS 'Auto-generated human-readable reference, e.g. RFQ-000001, from rfq_code_seq';
COMMENT ON COLUMN rfq.org_id IS 'Customer organization this RFQ was received from';
COMMENT ON COLUMN rfq.lead_id IS 'Optional link to the originating lead, if this RFQ was converted from an existing lead';
COMMENT ON COLUMN rfq.cable_type IS 'e.g. LV Power Cable, Control Cable, Instrumentation Cable, Solar Cable, etc.';
COMMENT ON COLUMN rfq.cable_standard IS 'Governing standard, e.g. IEC 60502, IS 1554, BS 5467, UL 1277';
COMMENT ON COLUMN rfq.conductor_material IS 'One of: Aluminium, Bare Copper, Tinned Copper';
COMMENT ON COLUMN rfq.insulation_material IS 'One of: PVC, XLPE, HR PVC, FR PVC, FRLS PVC, LSZH, PE, EPR, Silicon, Rubber, Other';
COMMENT ON COLUMN rfq.pd_id IS 'Populated once an AI-generated design is accepted and materialized into production_datasheet';
COMMENT ON COLUMN rfq.status IS 'RFQ pipeline status: 1=Draft, 2=Design Generated, 3=Engineering Approved, 4=Quoted';

CREATE INDEX IF NOT EXISTS idx_rfq_org_id ON rfq(org_id);
CREATE INDEX IF NOT EXISTS idx_rfq_lead_id ON rfq(lead_id);
CREATE INDEX IF NOT EXISTS idx_rfq_pd_id ON rfq(pd_id);

-- Sidebar menu entry, placed as a sibling of the existing "Production Datasheet" page
-- (inherits the same parent menu and rank bucket so it shows up in the Design & Costing group).
INSERT INTO menu_master (parent_id, menu_name, link, icon, parent_rank, child_rank)
SELECT parent_id, 'RFQ', '/design-and-costing/rfq', icon, parent_rank, child_rank - 1
FROM menu_master
WHERE link = '/design-and-costing/production-datasheet'
AND NOT EXISTS (SELECT 1 FROM menu_master WHERE link = '/design-and-costing/rfq');

-- Copy each user's existing Production Datasheet permission level onto the new RFQ menu item as a default.
INSERT INTO menu_permission (user_id, menu_id, add_opt, edit_opt, view_opt, delete_opt, excel_opt, pdf_opt, approve_opt, mailsent_opt, password_protect_opt, role_id, is_active, created_by, created_date)
SELECT mp.user_id, mm.id, mp.add_opt, mp.edit_opt, mp.view_opt, mp.delete_opt, mp.excel_opt, mp.pdf_opt, mp.approve_opt, mp.mailsent_opt, mp.password_protect_opt, mp.role_id, mp.is_active, mp.created_by, CURRENT_TIMESTAMP
FROM menu_permission mp
JOIN menu_master sibling ON sibling.id = mp.menu_id AND sibling.link = '/design-and-costing/production-datasheet'
JOIN menu_master mm ON mm.link = '/design-and-costing/rfq'
WHERE NOT EXISTS (
    SELECT 1 FROM menu_permission existing WHERE existing.menu_id = mm.id AND existing.user_id = mp.user_id
);
