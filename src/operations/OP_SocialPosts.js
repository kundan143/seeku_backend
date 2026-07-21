const { socialPosts, socialPostLikes, socialPostComments, socialCommentLikes } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

// Feed page — parameterized throughout (search/limit/offset never string-
// concatenated into the SQL) to avoid the injection-shaped pattern seen
// elsewhere in this codebase (raw ILIKE string interpolation).
// Fetches `limit + 1` rows so `hasMore` can be derived without a second
// COUNT query — the extra row (if present) is popped before returning.
exports.getAllData = async function ({ limit, offset, search, requesterId }) {
  try {
    const query = `
      SELECT sp.id, sp.content, sp.image_paths, sp.share_count, sp.created_date,
             um.id AS author_id, um.first_name, um.last_name,
             CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS author_name,
             um.profile_pic,
             (SELECT COUNT(*)::int FROM social_post_likes spl WHERE spl.post_id = sp.id) AS like_count,
             (SELECT COUNT(*)::int FROM social_post_comments spc WHERE spc.post_id = sp.id AND spc.status = 1) AS comment_count,
             EXISTS (
               SELECT 1 FROM social_post_likes spl2
               WHERE spl2.post_id = sp.id AND spl2.user_id = :requesterId
             ) AS liked_by_me
      FROM social_posts sp
      JOIN users_master um ON um.id = sp.created_by
      WHERE sp.status = 1
        AND (:search::text IS NULL OR sp.content ILIKE :search)
      ORDER BY sp.created_date DESC
      LIMIT :fetchLimit OFFSET :offset
    `;

    const rows = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: {
        requesterId: requesterId || null,
        search: search ? `%${search}%` : null,
        fetchLimit: limit + 1,
        offset,
      },
    });

    const hasMore = rows.length > limit;
    if (hasMore) rows.pop();

    responseCodes.SUCCESS.data = { rows, hasMore };
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Posts";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getOneData = async function (id) {
  try {
    const data = await socialPosts.findOne({ where: { id, status: 1 } });
    if (data) {
      responseCodes.SUCCESS.data = data;
      responseCodes.SUCCESS.message = "";
      return responseCodes.SUCCESS;
    }
    responseCodes.NOT_FOUND.data = null;
    responseCodes.NOT_FOUND.message = "No Record Found";
    return responseCodes.NOT_FOUND;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Post";
    return responseCodes.BAD_REQUEST;
  }
};

exports.addData = async function (body) {
  try {
    const result = await socialPosts.create(body.data);
    responseCodes.SUCCESS.data = result.id;
    responseCodes.SUCCESS.message = "Post Added Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Post";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateData = async function (body) {
  try {
    await socialPosts.update(body.data, { where: { id: body.id } });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Post Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Post";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  try {
    await socialPosts.update(body.data, { where: { id: body.id } });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Post Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Post";
    return responseCodes.BAD_REQUEST;
  }
};

exports.likePost = async function (body) {
  try {
    const [row] = await socialPostLikes.findOrCreate({
      where: { post_id: body.post_id, user_id: body.user_id },
      defaults: { post_id: body.post_id, user_id: body.user_id },
    });
    responseCodes.SUCCESS.data = row.id;
    responseCodes.SUCCESS.message = "Liked";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Like Post";
    return responseCodes.BAD_REQUEST;
  }
};

exports.unlikePost = async function (body) {
  try {
    await socialPostLikes.destroy({ where: { post_id: body.post_id, user_id: body.user_id } });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Unliked";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Unlike Post";
    return responseCodes.BAD_REQUEST;
  }
};

exports.incrementShare = async function (body) {
  try {
    const result = await socialPosts.increment("share_count", { by: 1, where: { id: body.post_id } });
    const updated = await socialPosts.findOne({ where: { id: body.post_id }, attributes: ["share_count"] });
    responseCodes.SUCCESS.data = { share_count: updated ? updated.share_count : null };
    responseCodes.SUCCESS.message = "Shared";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Share Post";
    return responseCodes.BAD_REQUEST;
  }
};

// Returns the FLAT list of every comment on a post (top-level and replies
// alike, unlimited depth) — the frontend nests them client-side via
// parent_comment_id, same approach as the org-hierarchy tree. Keeping
// nesting a client-side concern means adding a reply never needs a new
// depth-aware query on the backend.
exports.getComments = async function ({ post_id, requesterId }) {
  try {
    const query = `
      SELECT spc.id, spc.post_id, spc.parent_comment_id, spc.content, spc.created_date, spc.modified_date,
             um.id AS author_id, CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS author_name,
             um.profile_pic,
             (SELECT COUNT(*)::int FROM social_comment_likes scl WHERE scl.comment_id = spc.id) AS like_count,
             EXISTS (
               SELECT 1 FROM social_comment_likes scl2
               WHERE scl2.comment_id = spc.id AND scl2.user_id = :requesterId
             ) AS liked_by_me
      FROM social_post_comments spc
      JOIN users_master um ON um.id = spc.created_by
      WHERE spc.post_id = :post_id AND spc.status = 1
      ORDER BY spc.created_date ASC
    `;
    const rows = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { post_id, requesterId: requesterId || null },
    });
    responseCodes.SUCCESS.data = rows;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Comments";
    return responseCodes.BAD_REQUEST;
  }
};

exports.likeComment = async function (body) {
  try {
    const [row] = await socialCommentLikes.findOrCreate({
      where: { comment_id: body.comment_id, user_id: body.user_id },
      defaults: { comment_id: body.comment_id, user_id: body.user_id },
    });
    responseCodes.SUCCESS.data = row.id;
    responseCodes.SUCCESS.message = "Liked";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Like Comment";
    return responseCodes.BAD_REQUEST;
  }
};

exports.unlikeComment = async function (body) {
  try {
    await socialCommentLikes.destroy({ where: { comment_id: body.comment_id, user_id: body.user_id } });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Unliked";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Unlike Comment";
    return responseCodes.BAD_REQUEST;
  }
};

exports.addComment = async function (body) {
  try {
    const result = await socialPostComments.create(body.data);
    responseCodes.SUCCESS.data = result.id;
    responseCodes.SUCCESS.message = "Comment Added Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Comment";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateComment = async function (body) {
  try {
    await socialPostComments.update(body.data, { where: { id: body.id } });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Comment Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Comment";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteComment = async function (body) {
  try {
    await socialPostComments.update(body.data, { where: { id: body.id } });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Comment Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Comment";
    return responseCodes.BAD_REQUEST;
  }
};
