const OP_usersSalaryDetails = require("../../operations/OP_usersSalaryDetails");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_usersSalaryDetails.getAllData(req.body));
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_usersSalaryDetails.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_usersSalaryDetails.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_usersSalaryDetails.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_usersSalaryDetails.getOneData(req.body.id));
});

module.exports = router;