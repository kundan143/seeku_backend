-- 44_social_comment_replies_likes.sql
-- Threaded (unlimited-depth) comment replies + per-comment likes.

ALTER TABLE social_post_comments
    ADD COLUMN IF NOT EXISTS parent_comment_id BIGINT NULL
    REFERENCES social_post_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_social_post_comments_parent
    ON social_post_comments (parent_comment_id);

CREATE TABLE IF NOT EXISTS social_comment_likes (
    id              BIGSERIAL PRIMARY KEY,
    comment_id      BIGINT NOT NULL REFERENCES social_post_comments(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users_master(id),
    created_date    TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_social_comment_likes_comment
    ON social_comment_likes (comment_id);

COMMENT ON COLUMN social_post_comments.parent_comment_id IS 'Null = top-level comment; otherwise the comment this is a reply to (unlimited depth)';
COMMENT ON TABLE social_comment_likes IS 'One row per user-like on a comment; delete = unlike';
