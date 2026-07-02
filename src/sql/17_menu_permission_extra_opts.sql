-- ============================================================
--  Extend menu_permission with Excel export, PDF, Approve, and
--  Email-send permission flags (alongside add/edit/view/delete).
--  Existing rows default to 1 (granted) so no current workflow breaks;
--  admins can then restrict specific designations from the Permission screen.
-- ============================================================

ALTER TABLE menu_permission ADD COLUMN IF NOT EXISTS excel_opt    INTEGER NOT NULL DEFAULT 1;
ALTER TABLE menu_permission ADD COLUMN IF NOT EXISTS pdf_opt      INTEGER NOT NULL DEFAULT 1;
ALTER TABLE menu_permission ADD COLUMN IF NOT EXISTS approve_opt  INTEGER NOT NULL DEFAULT 1;
ALTER TABLE menu_permission ADD COLUMN IF NOT EXISTS mailsent_opt INTEGER NOT NULL DEFAULT 1;

COMMENT ON COLUMN menu_permission.excel_opt    IS 'Excel export permission for this menu';
COMMENT ON COLUMN menu_permission.pdf_opt      IS 'PDF generate/download permission for this menu';
COMMENT ON COLUMN menu_permission.approve_opt  IS 'Approve/reject action permission for this menu';
COMMENT ON COLUMN menu_permission.mailsent_opt IS 'Send-by-email action permission for this menu';
