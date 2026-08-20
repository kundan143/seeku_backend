-- Cable Design no longer collects/shows a separate "Design Name" - the saved-designs
-- list identifies each row by its Cable Type instead. Drop the now-unused column.
ALTER TABLE cable_design DROP COLUMN IF EXISTS design_name;
