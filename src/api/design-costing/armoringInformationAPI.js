const OP_armoringInformation = require("../../operations/OP_armoringInformation");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_armoringInformation.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_armoringInformation.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_armoringInformation.updateData(req.body));

});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_armoringInformation.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_armoringInformation.getOneData(req.body.id));
});

router.post('/getOneRowByDatasheet', async (req, res, next) => {
    return res.send(await OP_armoringInformation.getOneRowByDatasheet(req.body.pd_id));
});


module.exports = router;