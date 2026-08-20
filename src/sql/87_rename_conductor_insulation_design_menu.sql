-- Renames the "Conductor & Insulation Design" screen (added in migration 86) to
-- "Cable Design", matching the frontend route/component rename from
-- conductor-insulation-design to cable-design.
UPDATE menu_master
SET menu_name = 'Cable Design',
    link = '/design-and-costing/cable-design'
WHERE link = '/design-and-costing/conductor-insulation-design';
