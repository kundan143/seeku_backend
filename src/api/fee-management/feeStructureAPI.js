const OP_FeeStructure = require("../../operations/OP_FeeStructure");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.post('/getAllRows', async (req, res, next) => {
    return res.send(await OP_FeeStructure.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_FeeStructure.addData(req.body));

});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_FeeStructure.updateData(req.body));

});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_FeeStructure.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_FeeStructure.getOneData(req.body.id));
});

module.exports = router;