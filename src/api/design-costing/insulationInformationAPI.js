const OP_insulationInformation = require("../../operations/OP_insulationInformation");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_insulationInformation.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_insulationInformation.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_insulationInformation.updateData(req.body));

});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_insulationInformation.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_insulationInformation.getOneData(req.body.id));
});
// 5 = Get One Row
router.post('/getOneRowByDatasheet', async (req, res, next) => {
    return res.send(await OP_insulationInformation.getOneRowByDatasheet(req.body.rel_so_id));
});


module.exports = router;