const OP_StateMaster = require("../../operations/OP_StateMaster");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
	return res.send(await OP_StateMaster.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
	return res.send(await OP_StateMaster.addData(req.body));

});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
	return res.send(await OP_StateMaster.updateData(req.body));

});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
	return res.send(await OP_StateMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
	return res.send(await OP_StateMaster.getOneData(req.body.id));
});

// 6 = Get Country States
router.post('/getCountryStates', async (req, res, next) => {
	return res.send(await OP_StateMaster.getCountryStates(req.body.country_id));
});

module.exports = router;