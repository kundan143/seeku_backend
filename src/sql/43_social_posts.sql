-- 43_social_posts.sql
-- Dashboard social feed: posts, likes, comments.

CREATE TABLE IF NOT EXISTS social_posts (
    id              BIGSERIAL PRIMARY KEY,
    content         TEXT NOT NULL,
    image_path      TEXT NULL,
    share_count     INTEGER NOT NULL DEFAULT 0,
    status          SMALLINT NOT NULL DEFAULT 1,   -- 1 = active, 0 = soft-deleted
    created_by      BIGINT NOT NULL REFERENCES users_master(id),
    created_date    TIMESTAMP NULL,
    modified_by     BIGINT NULL REFERENCES users_master(id),
    modified_date   TIMESTAMP NULL,
    deleted_by      BIGINT NULL REFERENCES users_master(id),
    deleted_date    TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_social_posts_status_created
    ON social_posts (status, created_date DESC);

CREATE TABLE IF NOT EXISTS social_post_likes (
    id              BIGSERIAL PRIMARY KEY,
    post_id         BIGINT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users_master(id),
    created_date    TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_social_post_likes_post
    ON social_post_likes (post_id);

CREATE TABLE IF NOT EXISTS social_post_comments (
    id              BIGSERIAL PRIMARY KEY,
    post_id         BIGINT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    status          SMALLINT NOT NULL DEFAULT 1,
    created_by      BIGINT NOT NULL REFERENCES users_master(id),
    created_date    TIMESTAMP NULL,
    modified_by     BIGINT NULL REFERENCES users_master(id),
    modified_date   TIMESTAMP NULL,
    deleted_by      BIGINT NULL REFERENCES users_master(id),
    deleted_date    TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_social_post_comments_post_status
    ON social_post_comments (post_id, status, created_date);

COMMENT ON TABLE social_posts IS 'Dashboard social feed: user posts (text + optional image)';
COMMENT ON TABLE social_post_likes IS 'One row per user-like on a post; delete = unlike';
COMMENT ON TABLE social_post_comments IS 'Comments on a social_posts row; soft-deletable, editable by author';
COMMENT ON COLUMN social_posts.share_count IS 'Simple counter, incremented on share action; no per-user share log by design';
