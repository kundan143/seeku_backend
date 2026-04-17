ALTER TABLE production_datasheet
ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS item_id INTEGER REFERENCES item_master(id),
ADD COLUMN IF NOT EXISTS is_active INTEGER DEFAULT 1;
COMMENT ON COLUMN production_datasheet.is_active       IS '2: deleted, 1: active, 0: inactive';

ALTER TABLE cable_category_master drop COLUMN IF EXISTS status;
alter table cable_category_master add column IF NOT EXISTS is_active INTEGER DEFAULT 1;
COMMENT ON COLUMN cable_category_master.is_active       IS '2: deleted, 1: active, 0: inactive';
UPDATE cable_category_master SET is_active = 0 WHERE id != 3;

ALTER TABLE wire_cable_types_master drop COLUMN IF EXISTS status;
alter table wire_cable_types_master add column IF NOT EXISTS is_active INTEGER DEFAULT 1;
COMMENT ON COLUMN wire_cable_types_master.is_active IS '2: deleted, 1: active, 0: inactive';
UPDATE wire_cable_types_master SET is_active = 0 WHERE id != 3;

alter table production_datasheet add column is_stage integer default 0;

ALTER TABLE conductor_information ADD COLUMN IF NOT EXISTS pd_id INTEGER NOT NULL REFERENCES production_datasheet(id);
ALTER TABLE laid_up_information ADD COLUMN IF NOT EXISTS pd_id INTEGER NOT NULL REFERENCES production_datasheet(id);
ALTER TABLE inner_sheathing_information ADD COLUMN IF NOT EXISTS pd_id INTEGER NOT NULL REFERENCES production_datasheet(id);
ALTER TABLE insulation_information ADD COLUMN IF NOT EXISTS pd_id INTEGER NOT NULL REFERENCES production_datasheet(id);
ALTER TABLE armoring_information  ADD COLUMN IF NOT EXISTS pd_id INTEGER NOT NULL REFERENCES production_datasheet(id);
ALTER TABLE outer_sheathing_information ADD COLUMN IF NOT EXISTS pd_id INTEGER NOT NULL REFERENCES production_datasheet(id);
ALTER TABLE braiding_information  ADD COLUMN IF NOT EXISTS pd_id INTEGER NOT NULL REFERENCES production_datasheet(id);
ALTER TABLE pairing_information ADD COLUMN IF NOT EXISTS pd_id INTEGER NOT NULL REFERENCES production_datasheet(id);

delete from conductor_information;
delete from laid_up_information ;
delete from inner_sheathing_information ;
delete from insulation_information ;
delete from armoring_information ;
delete from outer_sheathing_information ;
delete from braiding_information ;
delete from pairing_information  ;

alter table conductor_information drop column IF EXISTS rel_so_id;
alter table laid_up_information drop column IF EXISTS rel_so_id;
alter table inner_sheathing_information drop column IF EXISTS rel_so_id;
alter table insulation_information drop column IF EXISTS rel_so_id;
alter table armoring_information drop column IF EXISTS rel_so_id;
alter table outer_sheathing_information drop column IF EXISTS rel_so_id;
alter table braiding_information drop column IF EXISTS rel_so_id;
alter table pairing_information drop column IF EXISTS rel_so_id;