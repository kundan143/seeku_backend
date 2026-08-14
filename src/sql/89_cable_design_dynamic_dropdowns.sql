-- Cable Design's dropdown lists (Cable Type, Conductor Material, Conductor Class,
-- Insulation Material, Outer/Inner Sheath Material, Armour Material, Drain Wire Material)
-- were hardcoded in the frontend/backend JS. Move them into the app's existing generic
-- dropdown_master/dropdown_value_master lookup pair (menu_id 100 = Cable Design), scoped
-- per field_name, so they're admin-editable like other master data instead of code changes.
--
-- Note: CABLE_TYPE_MODULES (which construction fields apply to each cable type) and
-- FORCED_CONDUCTOR_CLASS_BY_MATERIAL (Aluminium -> Class 2, Copper -> Class 5) stay
-- hardcoded in cableDesignAI.js / cable-design.component.ts, keyed by these field_value
-- strings - they're structural business logic, not plain lookup data. Renaming a value
-- here without updating those mappings will break that rule/module lookup for it.

INSERT INTO dropdown_master (menu_id, field_name, status, created_by)
SELECT 100, v.field_name, 1, 1
FROM (VALUES
	('Cable Type'), ('Conductor Material'), ('Conductor Class'), ('Insulation Material'),
	('Outer Sheath Material'), ('Inner Sheath Material'), ('Armour Material'), ('Drain Wire Material')
) AS v(field_name)
WHERE NOT EXISTS (
	SELECT 1 FROM dropdown_master dm WHERE dm.menu_id = 100 AND dm.field_name = v.field_name
);

INSERT INTO dropdown_value_master (field_id, field_value, status, created_by)
SELECT dm.id, v.field_value, 1, 1
FROM dropdown_master dm
JOIN (VALUES
	('Cable Type', 'Single Core'),
	('Cable Type', 'Multicore'),
	('Cable Type', 'Armoured'),
	('Cable Type', 'Unarmoured'),
	('Cable Type', 'Armoured Fire Survival'),
	('Cable Type', 'Unarmoured Fire Survival'),
	('Cable Type', 'Armoured Fire Survival (Individual Shielding)'),
	('Cable Type', 'Unarmoured Fire Survival (Individual Shielding)'),
	('Cable Type', 'Armoured Fire Survival (Individual and Overall Shielding)'),
	('Cable Type', 'Unarmoured Fire Survival (Individual and Overall Shielding)'),
	('Cable Type', 'Armoured Fire Survival (Overall Shielding)'),
	('Cable Type', 'Unarmoured Fire Survival (Overall Shielding)'),
	('Cable Type', 'Instrumentation'),
	('Cable Type', 'CAT 6 UTP'),
	('Cable Type', 'CAT 6 FTP'),
	('Cable Type', 'CAT 6 SFTP'),

	('Conductor Material', 'Aluminium'),
	('Conductor Material', 'Bare Copper'),
	('Conductor Material', 'Tinned Copper'),

	('Conductor Class', 'Class 1 (Solid)'),
	('Conductor Class', 'Class 2 (Semi Flex)'),
	('Conductor Class', 'Class 5 (Flexible)'),
	('Conductor Class', 'Class 6 (Super Flex)'),

	('Insulation Material', 'PVC'),
	('Insulation Material', 'XLPE'),
	('Insulation Material', 'HR PVC'),
	('Insulation Material', 'FR PVC'),
	('Insulation Material', 'FRLS PVC'),
	('Insulation Material', 'LSZH'),
	('Insulation Material', 'PE'),
	('Insulation Material', 'EPR'),
	('Insulation Material', 'Silicon'),
	('Insulation Material', 'Rubber'),
	('Insulation Material', 'Other'),

	('Outer Sheath Material', 'PVC'),
	('Outer Sheath Material', 'FR PVC'),
	('Outer Sheath Material', 'FRLS PVC'),
	('Outer Sheath Material', 'LSZH'),
	('Outer Sheath Material', 'PE'),
	('Outer Sheath Material', 'Rubber'),
	('Outer Sheath Material', 'Other'),

	('Inner Sheath Material', 'PVC'),
	('Inner Sheath Material', 'FR PVC'),
	('Inner Sheath Material', 'FRLS PVC'),
	('Inner Sheath Material', 'LSZH'),
	('Inner Sheath Material', 'PE'),
	('Inner Sheath Material', 'Rubber'),
	('Inner Sheath Material', 'Other'),

	('Armour Material', 'Galvanized Steel (GI) Wire'),
	('Armour Material', 'Galvanized Steel (GI) Strip'),
	('Armour Material', 'Aluminium Wire'),
	('Armour Material', 'Aluminium Strip'),
	('Armour Material', 'Stainless Steel Wire'),
	('Armour Material', 'Double Tape Armour'),

	('Drain Wire Material', 'ABC (Annealed Bare Copper)'),
	('Drain Wire Material', 'ATC (Annealed Tinned Copper)')
) AS v(field_name, field_value) ON dm.field_name = v.field_name AND dm.menu_id = 100
WHERE NOT EXISTS (
	SELECT 1 FROM dropdown_value_master dvm WHERE dvm.field_id = dm.id AND dvm.field_value = v.field_value
);
