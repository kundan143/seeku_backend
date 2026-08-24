-- Increment Letter emails (OP_SalaryIncrementHistory.emailLetter) are surfaced on the same
-- "Salary Slip Mail Log" screen (see OP_SalarySlipMailLog.getAllData, now a union of both
-- salary_slip_mail_log and increment_letter_mail_log) rather than a separate page/menu item -
-- relabel the existing menu entry to reflect that it's now a general mail log, without touching
-- its link/route or any menu_permission rows.
UPDATE menu_master SET menu_name = 'Mail Log'
WHERE link = '/hr/salary-slip-mail-log' AND menu_name = 'Salary Slip Mail Log';
