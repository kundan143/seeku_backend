const OP_UserDocumentMaster = require("../../operations/OP_UserDocumentMaster");

const express = require('express');
const router = express.Router();

// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_UserDocumentMaster.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_UserDocumentMaster.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_UserDocumentMaster.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_UserDocumentMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_UserDocumentMaster.getOneData(req.body.id));
});

// 6 = Get Rows By User ID
router.post('/getRowsByUser', async (req, res, next) => {
    return res.send(await OP_UserDocumentMaster.getDataByUserId(req.body.user_id));
});

module.exports = router;
