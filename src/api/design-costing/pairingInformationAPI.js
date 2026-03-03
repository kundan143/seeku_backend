const OP_pairingInformation = require("../../operations/OP_pairingInformation");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_pairingInformation.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_pairingInformation.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_pairingInformation.updateData(req.body));

});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_pairingInformation.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_pairingInformation.getOneData(req.body.id));
});
router.post('/getOneRowByDatasheet', async (req, res, next) => {
    return res.send(await OP_pairingInformation.getOneRowByDatasheet(req.body.rel_so_id));
});


module.exports = router;