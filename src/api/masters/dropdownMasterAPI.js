const OP_DropdownMaster = require("../../operations/OP_DropdownMaster");
const express = require('express');
const router = express.Router();

router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_DropdownMaster.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_DropdownMaster.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_DropdownMaster.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_DropdownMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_DropdownMaster.getOneData(req.body.id));
});

module.exports = router;
