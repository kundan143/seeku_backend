const OP_assetMaster = require("../../operations/OP_assetMaster");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_assetMaster.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_assetMaster.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_assetMaster.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_assetMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_assetMaster.getOneData(req.body.id));
});

// 6 = Bulk Create Rows
router.post('/bulkCreate', async (req, res, next) => {
    return res.send(await OP_assetMaster.bulkCreate(req.body));
});

module.exports = router;
