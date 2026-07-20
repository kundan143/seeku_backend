-- 47_company_news_multi_department.sql
-- Company news can now target more than one department — replace the single
-- department_id column with an array, backfilling existing single-department rows.

ALTER TABLE company_news ADD COLUMN IF NOT EXISTS department_ids INTEGER[] NULL;

UPDATE company_news
SET department_ids = ARRAY[department_id]
WHERE department_id IS NOT NULL AND department_ids IS NULL;

ALTER TABLE company_news DROP COLUMN IF EXISTS department_id;

COMMENT ON COLUMN company_news.department_ids IS 'List of department ids (0 or more) this news item targets';
