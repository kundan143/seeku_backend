const OP_ComponentLock = require("../../operations/OP_ComponentLock");
const express = require('express');
const router = express.Router();

router.post('/verify', async (req, res, next) => {
	return res.send(await OP_ComponentLock.verify(req));
});

router.post('/close', async (req, res, next) => {
	return res.send(await OP_ComponentLock.close(req));
});

module.exports = router;
