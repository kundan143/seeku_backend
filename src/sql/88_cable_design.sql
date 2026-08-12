-- Saved Cable Design records for the Design & Costing "Cable Design" screen. A record
-- captures the basic inputs (cable type, size, cores, materials) plus the full set of
-- AI-generated (and possibly user-edited) construction values as JSONB, since the field
-- set varies by cable_type (see cableDesignAI.js's module system) rather than being fixed.
CREATE TABLE IF NOT EXISTS cable_design (
  id BIGSERIAL PRIMARY KEY,
  design_name VARCHAR(255) NOT NULL,
  cable_type VARCHAR(100) NOT NULL,
  conductor_size NUMERIC(10, 3) NOT NULL,
  no_of_cores INTEGER NOT NULL,
  conductor_material VARCHAR(50) NOT NULL,
  insulation_material VARCHAR(50) NOT NULL,
  outer_sheath_material VARCHAR(50),
  inner_sheath_material VARCHAR(50),
  construction_values JSONB NOT NULL,
  status SMALLINT NOT NULL DEFAULT 1,
  created_by INTEGER NOT NULL REFERENCES users_master(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_by INTEGER REFERENCES users_master(id),
  modified_date TIMESTAMP,
  deleted_by INTEGER REFERENCES users_master(id),
  deleted_date TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cable_design_status ON cable_design(status);

COMMENT ON TABLE cable_design IS 'Saved cable designs from the Design & Costing "Cable Design" AI construction generator.';
COMMENT ON COLUMN cable_design.construction_values IS 'Per-cable_type construction field values (module system defined in cableDesignAI.js) - shape varies by cable_type.';
COMMENT ON COLUMN cable_design.outer_sheath_material IS 'User-selected outer sheath material, when the cable_type has an outer sheath.';
COMMENT ON COLUMN cable_design.inner_sheath_material IS 'User-selected inner sheath material, when the cable_type has an inner sheath.';
COMMENT ON COLUMN cable_design.status IS '1 = Active, 0 = Deleted (soft delete)';
