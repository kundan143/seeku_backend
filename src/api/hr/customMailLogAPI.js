const OP_CustomMailLog = require("../../operations/OP_CustomMailLog");

const express = require("express");
const router = express.Router();

router.post("/send", async (req, res, next) => {
	return res.send(await OP_CustomMailLog.sendCustomMail(req.body));
});

module.exports = router;
