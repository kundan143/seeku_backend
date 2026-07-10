const OP_Leads = require("../../operations/OP_Leads");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.post('/getAllRows', async (req, res, next) => {
    return res.send(await OP_Leads.getAllData(req.body));
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_Leads.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_Leads.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_Leads.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_Leads.getOneData(req.body.id));
});

// 6 = Get Change History
router.post('/getHistory', async (req, res, next) => {
    return res.send(await OP_Leads.getHistory(req.body.id));
});

// 7 = Get Pipeline Stages
router.post('/getStages', async (req, res, next) => {
    return res.send(await OP_Leads.getStages());
});

// 8 = Move Lead to a Different Stage
router.post('/moveStage', async (req, res, next) => {
    return res.send(await OP_Leads.moveStage(req.body));
});

// 9 = Get Stage Movement (Pipeline) History
router.post('/getStageHistory', async (req, res, next) => {
    return res.send(await OP_Leads.getStageHistory(req.body.id));
});

module.exports = router;
