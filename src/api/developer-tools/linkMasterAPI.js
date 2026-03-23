const OP_LinkMaster = require("../../operations/OP_LinkMaster");
const express = require('express');
const router = express.Router();

router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_LinkMaster.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_LinkMaster.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_LinkMaster.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_LinkMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_LinkMaster.getOneData(req.body.id));
});

module.exports = router;
