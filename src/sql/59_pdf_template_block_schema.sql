ALTER TABLE pdf_template_master ADD COLUMN IF NOT EXISTS block_schema JSONB;

COMMENT ON COLUMN pdf_template_master.block_schema IS 'Block layout for templates authored via the drag-and-drop visual builder. html_content is always the compiled/rendered artifact regardless of authoring mode; block_schema is null for hand-authored (raw HTML) templates.';
