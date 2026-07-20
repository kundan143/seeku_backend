const OP_ClientBranding = require("../../operations/OP_ClientBranding");

const express = require('express');
const router = express.Router();

// 1 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_ClientBranding.getOneData());
});

// 2 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_ClientBranding.updateData(req.body));
});

module.exports = router;
