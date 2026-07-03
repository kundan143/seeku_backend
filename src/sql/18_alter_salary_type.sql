ALTER TABLE users_salary_details ADD COLUMN IF NOT EXISTS salary_type SMALLINT DEFAULT 1;
COMMENT ON COLUMN users_salary_details.salary_type IS '1: Monthly, 2: Yearly';

ALTER TABLE users_salary_details ADD COLUMN IF NOT EXISTS pair_id BIGINT REFERENCES users_salary_details(id);
COMMENT ON COLUMN users_salary_details.pair_id IS 'Links the auto-generated Monthly/Yearly counterpart row created for the same salary entry';