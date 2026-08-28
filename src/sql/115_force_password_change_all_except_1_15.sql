-- One-off rollout: force every employee (except id 1 and 15) to change their password on next
-- login. See users_master.must_change_password / login.component.ts's forced-change dialog and
-- AuthGuard's independent enforcement - already-built machinery, this just re-arms the flag in
-- bulk instead of only on new-employee creation/bulk-import/resend-credentials.
UPDATE users_master
SET must_change_password = true
WHERE id NOT IN (1, 15);
