const OP_StageMaster = require("../../operations/OP_StageMaster");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.post('/getAllRows', async (req, res, next) => {
    return res.send(await OP_StageMaster.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_StageMaster.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_StageMaster.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_StageMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_StageMaster.getOneData(req.body.id));
});

module.exports = router;
