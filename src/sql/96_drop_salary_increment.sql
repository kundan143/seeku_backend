-- Reverts the Salary Increment feature (93_salary_increment.sql, 94_salary_payments_arrears.sql,
-- 95_salary_increment_old_components.sql) entirely - the feature was removed from the codebase.
ALTER TABLE salary_payments DROP COLUMN IF EXISTS arrears_amount;
ALTER TABLE salary_payments DROP COLUMN IF EXISTS increment_id;

DROP TABLE IF EXISTS salary_increment_master;

DELETE FROM menu_permission WHERE menu_id IN (SELECT id FROM menu_master WHERE link = '/hr/salary-increment');
DELETE FROM role_permission WHERE menu_id IN (SELECT id FROM menu_master WHERE link = '/hr/salary-increment');
DELETE FROM menu_master WHERE link = '/hr/salary-increment';
