const OP_Quotation = require("../../operations/OP_Quotation");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.post('/getAllRows', async (req, res, next) => {
    return res.send(await OP_Quotation.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_Quotation.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_Quotation.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_Quotation.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_Quotation.getOneData(req.body.id));
});

module.exports = router;
