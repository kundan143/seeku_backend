-- -- 89_cable_design_dynamic_dropdowns.sql inserted every field's values via a single
-- -- INSERT ... SELECT joined against a VALUES-derived table keyed by field_name. Postgres's
-- -- planner is free to reorder that join, so the resulting dropdown_value_master.id order
-- -- (what ORDER BY dvm.id ASC, the existing convention, sorts dropdowns by) came out scrambled
-- -- instead of matching the curated order the original hardcoded JS arrays used. Re-seed each
-- -- field's values with its own single-VALUES INSERT (no join to reorder) so id order == the
-- -- intended display order again.

-- DELETE FROM dropdown_value_master
-- WHERE field_id IN (SELECT id FROM dropdown_master WHERE menu_id = 100);

-- INSERT INTO dropdown_value_master (field_id, field_value, status, created_by)
-- SELECT (SELECT id FROM dropdown_master WHERE menu_id = 100 AND field_name = 'Cable Type'), v, 1, 1
-- FROM (VALUES
-- 	('Single Core'), ('Multicore'), ('Armoured'), ('Unarmoured'),
-- 	('Armoured Fire Survival'), ('Unarmoured Fire Survival'),
-- 	('Armoured Fire Survival (Individual Shielding)'), ('Unarmoured Fire Survival (Individual Shielding)'),
-- 	('Armoured Fire Survival (Individual and Overall Shielding)'), ('Unarmoured Fire Survival (Individual and Overall Shielding)'),
-- 	('Armoured Fire Survival (Overall Shielding)'), ('Unarmoured Fire Survival (Overall Shielding)'),
-- 	('Instrumentation'), ('CAT 6 UTP'), ('CAT 6 FTP'), ('CAT 6 SFTP')
-- ) AS t(v);

-- INSERT INTO dropdown_value_master (field_id, field_value, status, created_by)
-- SELECT (SELECT id FROM dropdown_master WHERE menu_id = 100 AND field_name = 'Conductor Material'), v, 1, 1
-- FROM (VALUES ('Aluminium'), ('Bare Copper'), ('Tinned Copper')) AS t(v);

-- INSERT INTO dropdown_value_master (field_id, field_value, status, created_by)
-- SELECT (SELECT id FROM dropdown_master WHERE menu_id = 100 AND field_name = 'Conductor Class'), v, 1, 1
-- FROM (VALUES ('Class 1 (Solid)'), ('Class 2 (Semi Flex)'), ('Class 5 (Flexible)'), ('Class 6 (Super Flex)')) AS t(v);

-- INSERT INTO dropdown_value_master (field_id, field_value, status, created_by)
-- SELECT (SELECT id FROM dropdown_master WHERE menu_id = 100 AND field_name = 'Insulation Material'), v, 1, 1
-- FROM (VALUES
-- 	('PVC'), ('XLPE'), ('HR PVC'), ('FR PVC'), ('FRLS PVC'), ('LSZH'), ('PE'), ('EPR'), ('Silicon'), ('Rubber'), ('Other')
-- ) AS t(v);

-- INSERT INTO dropdown_value_master (field_id, field_value, status, created_by)
-- SELECT (SELECT id FROM dropdown_master WHERE menu_id = 100 AND field_name = 'Outer Sheath Material'), v, 1, 1
-- FROM (VALUES ('PVC'), ('FR PVC'), ('FRLS PVC'), ('LSZH'), ('PE'), ('Rubber'), ('Other')) AS t(v);

-- INSERT INTO dropdown_value_master (field_id, field_value, status, created_by)
-- SELECT (SELECT id FROM dropdown_master WHERE menu_id = 100 AND field_name = 'Inner Sheath Material'), v, 1, 1
-- FROM (VALUES ('PVC'), ('FR PVC'), ('FRLS PVC'), ('LSZH'), ('PE'), ('Rubber'), ('Other')) AS t(v);

-- INSERT INTO dropdown_value_master (field_id, field_value, status, created_by)
-- SELECT (SELECT id FROM dropdown_master WHERE menu_id = 100 AND field_name = 'Armour Material'), v, 1, 1
-- FROM (VALUES
-- 	('Galvanized Steel (GI) Wire'), ('Galvanized Steel (GI) Strip'), ('Aluminium Wire'),
-- 	('Aluminium Strip'), ('Stainless Steel Wire'), ('Double Tape Armour')
-- ) AS t(v);

-- INSERT INTO dropdown_value_master (field_id, field_value, status, created_by)
-- SELECT (SELECT id FROM dropdown_master WHERE menu_id = 100 AND field_name = 'Drain Wire Material'), v, 1, 1
-- FROM (VALUES ('ABC (Annealed Bare Copper)'), ('ATC (Annealed Tinned Copper)')) AS t(v);
