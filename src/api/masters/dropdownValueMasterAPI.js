const OP_DropdownValueMaster = require("../../operations/OP_DropdownValueMaster");
const express = require('express');
const router = express.Router();

router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_DropdownValueMaster.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_DropdownValueMaster.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_DropdownValueMaster.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_DropdownValueMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_DropdownValueMaster.getOneData(req.body.id));
});

// 6 = Get Field Values
router.post('/getFieldValues', async (req, res, next) => {
    return res.send(await OP_DropdownValueMaster.getFieldValues(req.body.field_id));
});

// 7 = Get Field Details (menu + field name, independent of whether values exist yet)
router.post('/getFieldDetails', async (req, res, next) => {
    return res.send(await OP_DropdownValueMaster.getFieldDetails(req.body.field_id));
});

module.exports = router;
