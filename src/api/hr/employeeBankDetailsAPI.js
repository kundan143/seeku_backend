const OP_employeeBankDetails = require("../../operations/OP_employeeBankDetails");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_employeeBankDetails.getAllData(req.body));
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_employeeBankDetails.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_employeeBankDetails.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_employeeBankDetails.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_employeeBankDetails.getOneData(req.body.id));
});
// 5 = Get Last Five Holidays
router.get('/getLastFiveHolidays', async (req, res, next) => {
    return res.send(await OP_employeeBankDetails.getLastFiveHolidays());
});
// 5 = Holiday count
router.post('/getHolidaysCount', async (req, res, next) => {
    return res.send(await OP_employeeBankDetails.getHolidaysCount(req.body));
});

module.exports = router;