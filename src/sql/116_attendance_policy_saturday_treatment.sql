-- The existing "Alternate Saturdays" mode only lets an admin pick weeks that are fully OFF (see
-- attendance-settings.component.ts's "Off Saturdays (of the month)" picker) - it has no way to
-- express "these occurrences are a HALF day, others are a full working day", which is the actual
-- rule this app enforced in code until now (2nd/4th/5th Saturday = half day). This column lets
-- ALTERNATE mode's picked weeks be treated as either OFF (original meaning) or HALF_DAY.
ALTER TABLE attendance_policy ADD COLUMN IF NOT EXISTS saturday_alternate_treatment VARCHAR(20) NOT NULL DEFAULT 'OFF';

-- Seed a policy row reproducing today's actual, previously-hardcoded rule (2nd/4th/5th Saturday
-- half day, 9:00-5:30 office hours, 4hr/8hr half/full thresholds) so wiring attendance_policy into
-- the runtime logic doesn't silently change live attendance/payroll behavior the moment it deploys -
-- there is currently no attendance_policy row at all, so Saturday classification and the "Late"
-- bucket (which also depends on this table) would otherwise both go inert until someone visits the
-- settings screen. effective_from is set safely in the past so this is immediately in effect;
-- grace_period_minutes/total_working_hours use the settings form's own placeholder values (10 min /
-- 9 hrs) since no prior grace-period behavior ever actually ran (the policy table was always empty).
INSERT INTO attendance_policy (
  policy_name, effective_from, office_start_time, office_end_time, total_working_hours,
  half_day_threshold_hours, min_hours_full_day, grace_period_minutes,
  saturday_policy, saturday_alternate_weeks, saturday_alternate_treatment, sunday_policy,
  created_by, created_date
)
SELECT 'Default Policy', '2020-01-01', '09:00:00', '17:30:00', 9,
       4, 8, 10,
       'ALTERNATE', ARRAY['2', '4', '5'], 'HALF_DAY', 'OFF',
       1, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM attendance_policy);
