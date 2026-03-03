const OP_MaterialMaster = require("../../operations/OP_MaterialMaster");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_MaterialMaster.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_MaterialMaster.addData(req.body));

});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_MaterialMaster.updateData(req.body));

});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_MaterialMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_MaterialMaster.getOneData(req.body.id));
});
// 5 = Get Material By Cable Stage
router.post('/getMaterialByCableStage', async (req, res, next) => {
    return res.send(await OP_MaterialMaster.getMaterialByCableStage(req.body.cable_stage_id));
});

module.exports = router;