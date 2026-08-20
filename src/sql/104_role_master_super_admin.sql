-- Super Admin role flag: a role marked TRUE here always gets full view/add/edit/delete/
-- excel/pdf/approve/mailsent access to every menu and link at login time, including menus
-- added after the role was created - no per-menu menu_permission/link_permission rows needed.
-- Deliberately a normal, visible role attribute (editable from Role Master), not a hidden
-- bypass - see logingServiceRouter.js for where it's applied.
ALTER TABLE role_master ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN role_master.is_super_admin IS 'When true, users with this role get full access to every menu/link at login, including ones added later, bypassing menu_permission/link_permission rows entirely.';
