const OP_CableSpecDocument = require("../../operations/OP_CableSpecDocument");

const express = require('express');
const router = express.Router();

// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_CableSpecDocument.getAllData());
});

// 2 = Add Row - file must already be uploaded via /api/file/upload; body.data.file_url
// is that returned path
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_CableSpecDocument.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_CableSpecDocument.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_CableSpecDocument.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_CableSpecDocument.getOneData(req.body.id));
});

// 6 = Retry chunk/embed indexing for a document
router.post('/reindexRow', async (req, res, next) => {
    return res.send(await OP_CableSpecDocument.reindexRow(req.body));
});

// 7 = Extract cable design parameters from this document's PDF via Claude
router.post('/extractRow', async (req, res, next) => {
    return res.send(await OP_CableSpecDocument.extractData(req.body));
});

module.exports = router;
