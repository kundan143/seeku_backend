const OP_SocialPosts = require("../../operations/OP_SocialPosts");
const { isPostOwner, isCommentOwner } = require("../../services/socialPostAccess");
const { responseCodes } = require("../../services/baseReponse");

const express = require("express");
const router = express.Router();

// 1 = Get All Rows (paginated + searchable feed)
router.get("/getAllRows", async (req, res, next) => {
	const limit = parseInt(req.query.limit, 10) || 10;
	const offset = parseInt(req.query.offset, 10) || 0;
	const search = req.query.search || null;
	return res.send(await OP_SocialPosts.getAllData({ limit, offset, search, requesterId: req.headers.userId }));
});

// 2 = Get One Row
router.post("/getOneRow", async (req, res, next) => {
	return res.send(await OP_SocialPosts.getOneData(req.body.id));
});

// 3 = Add Row
router.post("/addRow", async (req, res, next) => {
	return res.send(await OP_SocialPosts.addData(req.body));
});

// 4 = Update Row — author only
router.post("/updateRow", async (req, res, next) => {
	if (!(await isPostOwner(req.headers.userId, req.body.id))) {
		return res.send(responseCodes.FORBIDDEN);
	}
	return res.send(await OP_SocialPosts.updateData(req.body));
});

// 5 = Delete Row (soft) — author only
router.post("/deleteRow", async (req, res, next) => {
	if (!(await isPostOwner(req.headers.userId, req.body.id))) {
		return res.send(responseCodes.FORBIDDEN);
	}
	return res.send(await OP_SocialPosts.deleteData(req.body));
});

// 6 = Like / Unlike
router.post("/like", async (req, res, next) => {
	return res.send(await OP_SocialPosts.likePost(req.body));
});
router.post("/unlike", async (req, res, next) => {
	return res.send(await OP_SocialPosts.unlikePost(req.body));
});

// 7 = Share
router.post("/share", async (req, res, next) => {
	return res.send(await OP_SocialPosts.incrementShare(req.body));
});

// 8 = Comments
router.post("/getComments", async (req, res, next) => {
	return res.send(await OP_SocialPosts.getComments(req.body.post_id));
});
router.post("/addComment", async (req, res, next) => {
	return res.send(await OP_SocialPosts.addComment(req.body));
});
router.post("/updateComment", async (req, res, next) => {
	if (!(await isCommentOwner(req.headers.userId, req.body.id))) {
		return res.send(responseCodes.FORBIDDEN);
	}
	return res.send(await OP_SocialPosts.updateComment(req.body));
});
router.post("/deleteComment", async (req, res, next) => {
	if (!(await isCommentOwner(req.headers.userId, req.body.id))) {
		return res.send(responseCodes.FORBIDDEN);
	}
	return res.send(await OP_SocialPosts.deleteComment(req.body));
});

module.exports = router;
