-- ============================================================
--  Extend user_activity_log to also capture every API call
--  (method + sanitized request body), not just login/logout/page_visit.
-- ============================================================

ALTER TABLE user_activity_log ADD COLUMN IF NOT EXISTS method VARCHAR(10);
ALTER TABLE user_activity_log ADD COLUMN IF NOT EXISTS request_body JSONB;

CREATE INDEX IF NOT EXISTS idx_user_activity_log_method ON user_activity_log(method);

COMMENT ON COLUMN user_activity_log.method       IS 'HTTP method of the API call (event_type = api_call)';
COMMENT ON COLUMN user_activity_log.request_body IS 'Sanitized request body (password/token fields redacted)';
