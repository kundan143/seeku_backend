const OP_CableStageMaster = require("../../operations/OP_CableStageMaster");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_CableStageMaster.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_CableStageMaster.addData(req.body));

});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_CableStageMaster.updateData(req.body));

});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_CableStageMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_CableStageMaster.getOneData(req.body.id));
});

// 6 = Get Cable Stages
router.post('/getCableTypeStages', async (req, res, next) => {
    return res.send(await OP_CableStageMaster.getCableTypeStages(req.body.wire_cable_type_id));
});

module.exports = router;