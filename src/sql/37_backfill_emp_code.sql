-- One-time backfill: assign emp_code to employees created before emp_code existed.
-- Groups existing rows by doj (falling back to created_date when doj is unset) and
-- numbers them within each day, matching the YYMMDD + 4-digit sequence format used
-- by generateEmpCode().
WITH numbered AS (
  SELECT
    id,
    COALESCE(doj, created_date::date) AS code_date,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(doj, created_date::date)
      ORDER BY created_date, id
    ) AS seq
  FROM users_master
  WHERE emp_code IS NULL
)
UPDATE users_master u
SET emp_code = to_char(numbered.code_date, 'YYMMDD') || lpad(numbered.seq::text, 4, '0')
FROM numbered
WHERE u.id = numbered.id;

-- Sync emp_code_counter so future generateEmpCode() calls continue from the correct
-- sequence instead of colliding with the codes just backfilled above. Derives
-- code_date from the emp_code value itself (its YYMMDD prefix) rather than
-- recomputing from doj/created_date, so it stays correct for any pre-existing
-- emp_code values regardless of what basis generated them.
INSERT INTO emp_code_counter (code_date, last_seq)
SELECT to_date(left(emp_code, 6), 'YYMMDD') AS code_date, COUNT(*)
FROM users_master
WHERE emp_code IS NOT NULL
GROUP BY to_date(left(emp_code, 6), 'YYMMDD')
ON CONFLICT (code_date) DO UPDATE
SET last_seq = GREATEST(emp_code_counter.last_seq, EXCLUDED.last_seq);
