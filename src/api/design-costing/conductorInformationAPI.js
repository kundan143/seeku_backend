const OP_conductorInformation = require("../../operations/OP_conductorInformation");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_conductorInformation.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_conductorInformation.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_conductorInformation.updateData(req.body));

});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_conductorInformation.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_conductorInformation.getOneData(req.body.id));
});

router.post('/getOneRowByDatasheet', async (req, res, next) => {
    return res.send(await OP_conductorInformation.getOneRowByDatasheet(req.body.rel_so_id));
});


module.exports = router;