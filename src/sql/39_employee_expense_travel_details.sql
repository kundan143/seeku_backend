-- A Travel expense can have multiple legs (e.g. home -> office -> client site), each with its
-- own vehicle/distance and a sub_total. rate_per_km/sub_total are stored per-leg (not looked up
-- from a rate table) so historical records keep the rate/amount in effect when submitted, even if
-- the per-km rate changes later. employee_expense.amount is the sum of all legs' sub_total.
CREATE TABLE IF NOT EXISTS employee_expense_travel_leg (
  id BIGSERIAL PRIMARY KEY,
  employee_expense_id BIGINT NOT NULL REFERENCES employee_expense(id) ON DELETE CASCADE,
  from_location_id BIGINT NOT NULL REFERENCES city_master(id),
  to_location_id BIGINT NOT NULL REFERENCES city_master(id),
  purpose VARCHAR(255) NOT NULL,
  vehicle_type VARCHAR(10) NOT NULL CHECK (vehicle_type IN ('CAR', 'BIKE')),
  distance_km NUMERIC(10, 2) NOT NULL,
  rate_per_km NUMERIC(10, 2) NOT NULL,
  sub_total NUMERIC(12, 2) NOT NULL,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE employee_expense_travel_leg IS 'One trip leg of a Travel-type employee_expense; an expense can have multiple legs';
COMMENT ON COLUMN employee_expense_travel_leg.employee_expense_id IS 'Parent expense row (references employee_expense.id, cascades on delete)';
COMMENT ON COLUMN employee_expense_travel_leg.from_location_id IS 'Starting city (references city_master.id)';
COMMENT ON COLUMN employee_expense_travel_leg.to_location_id IS 'Destination city (references city_master.id)';
COMMENT ON COLUMN employee_expense_travel_leg.purpose IS 'Purpose of this trip leg (e.g. Client meeting, Site visit)';
COMMENT ON COLUMN employee_expense_travel_leg.vehicle_type IS 'Vehicle used for this leg (CAR or BIKE)';
COMMENT ON COLUMN employee_expense_travel_leg.rate_per_km IS 'Per-km rate applied at submission time (CAR=10, BIKE=6)';
COMMENT ON COLUMN employee_expense_travel_leg.sub_total IS 'distance_km * rate_per_km for this leg';
