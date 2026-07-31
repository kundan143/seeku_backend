ALTER TABLE rfq ADD COLUMN IF NOT EXISTS ai_design JSONB;
ALTER TABLE rfq ADD COLUMN IF NOT EXISTS ai_design_generated_date TIMESTAMP;
ALTER TABLE rfq ADD COLUMN IF NOT EXISTS ai_design_updated_by INTEGER REFERENCES users_master(id);
ALTER TABLE rfq ADD COLUMN IF NOT EXISTS ai_design_updated_date TIMESTAMP;

COMMENT ON COLUMN rfq.ai_design IS 'AI-generated cable design (conductor/insulation/coreIdentification/layingUp/innerSheath/armouring/outerSheath/electricalProperties/mechanicalProperties/manufacturingProcess), each leaf field shaped as {value, confidence, reason}. Fully editable by the reviewing engineer after generation.';
COMMENT ON COLUMN rfq.ai_design_generated_date IS 'Timestamp of the last AI generation for this RFQ';
COMMENT ON COLUMN rfq.ai_design_updated_by IS 'User who last hand-edited the AI-generated design';
COMMENT ON COLUMN rfq.ai_design_updated_date IS 'Timestamp of the last hand-edit to the AI-generated design';
