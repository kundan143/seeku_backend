-- user_leave_balance is no longer scoped per calendar year (a single ongoing balance per
-- employee/leave type, accrued monthly by the updateLeaveBalanceAllocation cron) and
-- carry-forward is no longer tracked as a separate concept - both are folded away.
ALTER TABLE user_leave_balance DROP COLUMN IF EXISTS year;
ALTER TABLE user_leave_balance DROP COLUMN IF EXISTS carry_forward_days;
