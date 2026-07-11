-- ============================================================
--  role_permission: default menu-permission template per role.
--  Mirrors menu_permission's shape but is keyed by role_id instead
--  of user_id. When a user is assigned a role (creation or
--  reassignment), the backend copies these rows into menu_permission
--  for that user as their starting point — see OP_UsersMaster.js.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.role_permission (
    id BIGSERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES public.role_master(id),
    menu_id INTEGER NOT NULL REFERENCES public.menu_master(id),
    add_opt      INTEGER NOT NULL DEFAULT 0,
    edit_opt     INTEGER NOT NULL DEFAULT 0,
    view_opt     INTEGER NOT NULL DEFAULT 0,
    delete_opt   INTEGER NOT NULL DEFAULT 0,
    excel_opt    INTEGER NOT NULL DEFAULT 1,
    pdf_opt      INTEGER NOT NULL DEFAULT 1,
    approve_opt  INTEGER NOT NULL DEFAULT 1,
    mailsent_opt INTEGER NOT NULL DEFAULT 1,
    is_active    INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES public.users_master(id),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER REFERENCES public.users_master(id),
    modified_date TIMESTAMP,
    UNIQUE (role_id, menu_id)
);

COMMENT ON TABLE  public.role_permission                IS 'Default menu-permission template per role, copied onto users when a role is assigned';
COMMENT ON COLUMN public.role_permission.role_id        IS 'FK -> role_master.id — the role this template row belongs to';
COMMENT ON COLUMN public.role_permission.menu_id         IS 'FK -> menu_master.id — the menu this permission applies to';
COMMENT ON COLUMN public.role_permission.add_opt         IS 'Create/Add permission for this menu';
COMMENT ON COLUMN public.role_permission.edit_opt        IS 'Edit permission for this menu';
COMMENT ON COLUMN public.role_permission.view_opt        IS 'View permission for this menu';
COMMENT ON COLUMN public.role_permission.delete_opt      IS 'Delete permission for this menu';
COMMENT ON COLUMN public.role_permission.excel_opt       IS 'Excel export permission for this menu';
COMMENT ON COLUMN public.role_permission.pdf_opt         IS 'PDF generate/download permission for this menu';
COMMENT ON COLUMN public.role_permission.approve_opt     IS 'Approve/reject action permission for this menu';
COMMENT ON COLUMN public.role_permission.mailsent_opt    IS 'Send-by-email action permission for this menu';
