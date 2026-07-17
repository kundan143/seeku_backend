-- One-time backfill: assign emp_code to employees created before emp_code existed.
-- Groups existing rows by their real created_date (day) and numbers them within each day,
-- matching the YYMMDD + 4-digit sequence format used by generateEmpCode().
WITH numbered AS (
  SELECT
    id,
    created_date::date AS code_date,
    ROW_NUMBER() OVER (PARTITION BY created_date::date ORDER BY created_date, id) AS seq
  FROM users_master
  WHERE emp_code IS NULL
)
UPDATE users_master u
SET emp_code = to_char(numbered.code_date, 'YYMMDD') || lpad(numbered.seq::text, 4, '0')
FROM numbered
WHERE u.id = numbered.id;

-- Sync emp_code_counter so future generateEmpCode() calls continue from the correct
-- sequence instead of colliding with the codes just backfilled above.
INSERT INTO emp_code_counter (code_date, last_seq)
SELECT created_date::date, COUNT(*)
FROM users_master
WHERE emp_code IS NOT NULL
GROUP BY created_date::date
ON CONFLICT (code_date) DO UPDATE
SET last_seq = GREATEST(emp_code_counter.last_seq, EXCLUDED.last_seq);
