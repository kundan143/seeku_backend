const OP_braidingInformation = require("../../operations/OP_braidingInformation");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_braidingInformation.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_braidingInformation.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_braidingInformation.updateData(req.body));

});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_braidingInformation.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_braidingInformation.getOneData(req.body.id));
});

router.post('/getOneRowByDatasheet', async (req, res, next) => {
    return res.send(await OP_braidingInformation.getOneRowByDatasheet(req.body.rel_so_id));
});


module.exports = router;