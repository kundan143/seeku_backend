const OP_WireCableTypeMaster = require("../../operations/OP_WireCableTypeMaster");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_WireCableTypeMaster.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_WireCableTypeMaster.addData(req.body));

});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_WireCableTypeMaster.updateData(req.body));

});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_WireCableTypeMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_WireCableTypeMaster.getOneData(req.body.id));
});

// 6 = Get Wire Cable Type
router.post('/getDataUsingCableCategory', async (req, res, next) => {
    return res.send(await OP_WireCableTypeMaster.getDataUsingCableCategory(req.body.cable_category_id));
});

module.exports = router;