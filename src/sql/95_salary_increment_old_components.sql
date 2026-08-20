-- Snapshot of the exact pre-increment earning components (Basic/DA/HRA/etc.), so deleting an
-- increment can restore users_salary_details to precisely what it was before, rather than
-- reverse-deriving it from old_gross_salary/increment factor (which only holds up if nothing
-- else touched those fields in between).
ALTER TABLE salary_increment_master ADD COLUMN IF NOT EXISTS old_components JSONB;

COMMENT ON COLUMN salary_increment_master.old_components IS 'Snapshot of basic_salary/dearness_allowance/city_allowance/hra/conveyance/medical_allowance/travel_allowance/special_allowance immediately before this increment was applied - used to revert users_salary_details when the increment is deleted.';
