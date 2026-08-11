-- Stores the AI-extracted cable design parameters (same shape as production_datasheet's
-- AI-generated design) read directly from the uploaded spec PDF, so the extraction only
-- needs to run once per document and can be viewed anytime afterward.
ALTER TABLE cable_spec_document ADD COLUMN IF NOT EXISTS extracted_design JSONB;
ALTER TABLE cable_spec_document ADD COLUMN IF NOT EXISTS extracted_at TIMESTAMP;

COMMENT ON COLUMN cable_spec_document.extracted_design IS 'AI-extracted cable design parameters read from this PDF (per-field value/confidence/reason), via cableDesignAI.extractDesignFromPdf';
COMMENT ON COLUMN cable_spec_document.extracted_at IS 'Timestamp of the most recent AI extraction run for this document';
