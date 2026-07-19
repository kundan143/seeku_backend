const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

// Only the author may edit/delete their own post or comment — checked
// server-side against req.headers.userId (set by the JWT middleware from
// the decoded token), not the client-supplied body, so a tampered request
// still can't touch someone else's content.
async function isPostOwner(requesterId, postId) {
  if (!requesterId || !postId) return false;
  const rows = await sequelize.query(
    `SELECT 1 FROM social_posts WHERE id = :postId AND created_by = :requesterId AND status = 1 LIMIT 1`,
    { type: QueryTypes.SELECT, replacements: { postId, requesterId } }
  );
  return rows.length > 0;
}

async function isCommentOwner(requesterId, commentId) {
  if (!requesterId || !commentId) return false;
  const rows = await sequelize.query(
    `SELECT 1 FROM social_post_comments WHERE id = :commentId AND created_by = :requesterId AND status = 1 LIMIT 1`,
    { type: QueryTypes.SELECT, replacements: { commentId, requesterId } }
  );
  return rows.length > 0;
}

module.exports = { isPostOwner, isCommentOwner };
