const OP_PaymentTermMaster = require("../../operations/OP_PaymentTermMaster");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.post('/getAllRows', async (req, res, next) => {
	return res.send(await OP_PaymentTermMaster.getAllData(req.body));
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
	return res.send(await OP_PaymentTermMaster.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
	return res.send(await OP_PaymentTermMaster.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
	return res.send(await OP_PaymentTermMaster.deleteData(req.body));

});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
	return res.send(await OP_PaymentTermMaster.getOneData(req.body.id));
});

// 6 = Get Type Wise Payment Terms
router.post('/getTypeWisePaymentTerms', async (req, res, next) => {
	return res.send(await OP_PaymentTermMaster.getTypeWisePaymentTerms(req.body.type));
});

// 7 = Get Method Wise Payment Terms
router.post('/getMethodWisePaymentTerms', async (req, res, next) => {
	return res.send(await OP_PaymentTermMaster.getMethodWisePaymentTerms(req.body));
});


module.exports = router;