-- LOP (unpaid leave) detection was a hardcoded string match on leave_code = 'LOP' in half a dozen
-- places (OP_AttendancePunch.js, OP_usersLeave.js) - so even with a working Leave Type Master
-- screen, an admin couldn't create a NEW unpaid leave type that actually behaves as unpaid; only
-- a type coded exactly "LOP" ever would. This makes it a real, editable column instead.
ALTER TABLE leave_type_master ADD COLUMN IF NOT EXISTS is_unpaid BOOLEAN NOT NULL DEFAULT false;
UPDATE leave_type_master SET is_unpaid = true WHERE upper(trim(leave_code)) = 'LOP';

-- Sidebar menu entry for the new Leave Type Master screen - the backend CRUD API already existed
-- (OP_leaveTypeMaster.js) but had no frontend screen at all, so leave types could only be
-- created/edited via direct SQL. Placed as a sibling of "Attendance Core Settings" (same HR admin-
-- config group), inheriting its parent/icon, appended after all existing siblings.
INSERT INTO menu_master (parent_id, menu_name, link, icon, parent_rank, child_rank)
SELECT sibling.parent_id, 'Leave Type Master', '/hr/leave-type-master', 'pi pi-tags', sibling.parent_rank,
       (SELECT COALESCE(MAX(child_rank), 0) + 1 FROM menu_master WHERE parent_id = sibling.parent_id)
FROM menu_master sibling
WHERE sibling.link = '/hr/attendance-settings'
AND NOT EXISTS (SELECT 1 FROM menu_master WHERE link = '/hr/leave-type-master');

-- Copy each user's existing Attendance Core Settings permission level onto the new menu item as a default.
INSERT INTO menu_permission (user_id, menu_id, add_opt, edit_opt, view_opt, delete_opt, excel_opt, pdf_opt, approve_opt, mailsent_opt, password_protect_opt, role_id, is_active, created_by, created_date)
SELECT mp.user_id, mm.id, mp.add_opt, mp.edit_opt, mp.view_opt, mp.delete_opt, mp.excel_opt, mp.pdf_opt, mp.approve_opt, mp.mailsent_opt, mp.password_protect_opt, mp.role_id, mp.is_active, mp.created_by, CURRENT_TIMESTAMP
FROM menu_permission mp
JOIN menu_master sibling ON sibling.id = mp.menu_id AND sibling.link = '/hr/attendance-settings'
JOIN menu_master mm ON mm.link = '/hr/leave-type-master'
WHERE NOT EXISTS (
    SELECT 1 FROM menu_permission existing WHERE existing.menu_id = mm.id AND existing.user_id = mp.user_id
);
