-- 45_social_post_multiple_images.sql
-- Posts can now carry more than one image — replace the single image_path
-- column with an ordered array, backfilling any existing single-image posts.

ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS image_paths TEXT[] NULL;

UPDATE social_posts
SET image_paths = ARRAY[image_path]
WHERE image_path IS NOT NULL AND image_paths IS NULL;

ALTER TABLE social_posts DROP COLUMN IF EXISTS image_path;

COMMENT ON COLUMN social_posts.image_paths IS 'Ordered list of uploaded image paths (0 or more) attached to the post';
