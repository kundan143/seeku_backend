const OP_ItemMaster = require("../../operations/OP_ItemMaster");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_ItemMaster.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_ItemMaster.addData(req.body));

});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_ItemMaster.updateData(req.body));

});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_ItemMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_ItemMaster.getOneData(req.body.id));
});
// 5 = Get Material By Cable Stage
router.post('/getMaterialByCableStage', async (req, res, next) => {
    return res.send(await OP_ItemMaster.getMaterialByCableStage(req.body.cable_stage_id));
});

module.exports = router;