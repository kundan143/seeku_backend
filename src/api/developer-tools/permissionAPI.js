
const OP_Permission = require("../../operations/OP_Permission");
const express = require('express');
const router = express.Router();

// 1 = Get All Rows
router.post('/getPermissions', async (req, res, next) => {
    return res.send(await OP_Permission.getPermissions(req.body));
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_Permission.addData(req.body));
});

// // 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_Permission.updateData(req.body));
});

// // 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_Permission.deleteData(req.body));
});

// // 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_Permission.getOneData(req.body.id));
});

module.exports = router;
