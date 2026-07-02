-- ============================================================
--  Table: user_activity_log
--  Description: Append-only audit trail of login, logout, and
--               page/module-visit events for every user.
-- ============================================================

CREATE TABLE user_activity_log (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT REFERENCES users_master(id),
    event_type    VARCHAR(20) NOT NULL,           -- login | logout | page_visit
    module_name   VARCHAR(100),                   -- top-level module, e.g. 'HR', 'Masters'
    route_path    TEXT,                           -- full Angular route, e.g. '/hr/salary-payment'
    page_title    VARCHAR(255),                   -- page/breadcrumb title at time of visit
    ip_address    VARCHAR(64),
    user_agent    TEXT,
    created_date  TIMESTAMP DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_user_activity_log_user    ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_type    ON user_activity_log(event_type);
CREATE INDEX idx_user_activity_log_date    ON user_activity_log(created_date);
CREATE INDEX idx_user_activity_log_module  ON user_activity_log(module_name);

-- ── Comments ──────────────────────────────────────────────────────────────────
COMMENT ON TABLE  user_activity_log             IS 'Append-only login/logout/page-visit audit trail';
COMMENT ON COLUMN user_activity_log.event_type  IS 'login, logout, or page_visit';
COMMENT ON COLUMN user_activity_log.module_name IS 'Top-level app module derived from the route (HR, Masters, Sales, ...)';


-- ============================================================
--  Menu entry: Activity Log under Developer Tools
-- ============================================================
WITH dt_parent AS (
    SELECT id FROM menu_master WHERE menu_name = 'Developer Tools' AND parent_id IS NULL LIMIT 1
)
INSERT INTO menu_master (parent_id, menu_name, link, icon, parent_rank, child_rank)
SELECT dt_parent.id, 'Activity Log', '/developer-tools/activity-log', 'pi pi-fw pi-history', 2, 6
FROM dt_parent
WHERE NOT EXISTS (
    SELECT 1 FROM menu_master WHERE menu_name = 'Activity Log'
);

-- Grant full access to all admin users (role_id = 1)
INSERT INTO menu_permission (designation_id, menu_id, add_opt, edit_opt, view_opt, delete_opt, user_id, is_active, created_by, created_date)
SELECT
    um.designation_id,
    mm.id,
    1, 1, 1, 1,
    um.id,
    1,
    um.id,
    NOW()
FROM menu_master mm
CROSS JOIN users_master um
WHERE mm.link = '/developer-tools/activity-log'
  AND um.role_id = 1
  AND um.account_block = FALSE
  AND NOT EXISTS (
      SELECT 1 FROM menu_permission mp
      WHERE mp.menu_id = mm.id AND mp.user_id = um.id
  );
