const OP_productionDatasheet = require("../../operations/OP_productionDatasheet");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_productionDatasheet.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_productionDatasheet.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_productionDatasheet.updateData(req.body));

});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_productionDatasheet.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_productionDatasheet.getOneData(req.body.rel_so_id));
});
router.post('/getDatasheetDetails', async (req, res, next) => {
    return res.send(await OP_productionDatasheet.getDatasheetDetails(req.body.rel_so_id));
});

router.post('/addStages', async (req, res) => {
  return res.send(await OP_productionDatasheet.addStages(req.body));
});

router.post('/getStages', async (req, res) => {
  return res.send(await OP_productionDatasheet.getStages(req.body.rel_so_id));
});

router.post('/approveDatasheet', async (req, res) => {
  return res.send(await OP_productionDatasheet.approveDatasheet(req.body));
});

router.post('/rejectDatasheet', async (req, res) => {
  return res.send(await OP_productionDatasheet.rejectDatasheet(req.body));
});

module.exports = router;