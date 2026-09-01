-- Sidebar menu entry for the new Statutory Payments page (/hr/statutory-payments) - PF Monthly
-- and ESI Detail tabs over already-processed payroll (salary_payments), for statutory filing
-- review/export. Placed as a sibling of "Salary Payment" (same HR group), inheriting its
-- parent/icon.
INSERT INTO menu_master (parent_id, menu_name, link, icon, parent_rank, child_rank)
SELECT sibling.parent_id, 'Statutory Payments', '/hr/statutory-payments', 'pi pi-shield', sibling.parent_rank,
       (SELECT COALESCE(MAX(child_rank), 0) + 1 FROM menu_master WHERE parent_id = sibling.parent_id)
FROM menu_master sibling
WHERE sibling.link = '/hr/salary-payment'
AND NOT EXISTS (SELECT 1 FROM menu_master WHERE link = '/hr/statutory-payments');

-- Copy each user's existing Salary Payment permission level onto the new menu item as a default.
INSERT INTO menu_permission (user_id, menu_id, add_opt, edit_opt, view_opt, delete_opt, excel_opt, pdf_opt, approve_opt, mailsent_opt, password_protect_opt, role_id, is_active, created_by, created_date)
SELECT mp.user_id, mm.id, mp.add_opt, mp.edit_opt, mp.view_opt, mp.delete_opt, mp.excel_opt, mp.pdf_opt, mp.approve_opt, mp.mailsent_opt, mp.password_protect_opt, mp.role_id, mp.is_active, mp.created_by, CURRENT_TIMESTAMP
FROM menu_permission mp
JOIN menu_master sibling ON sibling.id = mp.menu_id AND sibling.link = '/hr/salary-payment'
JOIN menu_master mm ON mm.link = '/hr/statutory-payments'
WHERE NOT EXISTS (
    SELECT 1 FROM menu_permission existing WHERE existing.menu_id = mm.id AND existing.user_id = mp.user_id
);
