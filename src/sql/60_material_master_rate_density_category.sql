ALTER TABLE material_master ADD COLUMN IF NOT EXISTS rate NUMERIC(12,2);
ALTER TABLE material_master ADD COLUMN IF NOT EXISTS density NUMERIC(12,3);
ALTER TABLE material_master ADD COLUMN IF NOT EXISTS material_category_id INTEGER REFERENCES dropdown_value_master(id);

COMMENT ON COLUMN material_master.rate IS 'Rate/price of the material per unit (see uom_id)';
COMMENT ON COLUMN material_master.density IS 'Material density';
COMMENT ON COLUMN material_master.material_category_id IS 'Material category - references dropdown_value_master(id), configured via Developer Tools > Dropdown Master ("Material Category" field)';

CREATE INDEX IF NOT EXISTS idx_material_master_material_category_id ON material_master(material_category_id);
