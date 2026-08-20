-- Cable Design gets a "Generate PDF" button that renders a saved design through a
-- PDF Template Master template (template_type = 'cable_design'), the same pattern
-- already used for the Salary Slip PDF. pdf_template_id remembers which template
-- version produced pdf_url, so editing/replacing the default template afterwards
-- can't retroactively change an already-generated PDF.
ALTER TABLE cable_design ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(500);
ALTER TABLE cable_design ADD COLUMN IF NOT EXISTS pdf_template_id INTEGER REFERENCES pdf_template_master(id);
