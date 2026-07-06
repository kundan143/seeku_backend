const OP_DocumentTypeMaster = require("../../operations/OP_DocumentTypeMaster");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
	return res.send(await OP_DocumentTypeMaster.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
	return res.send(await OP_DocumentTypeMaster.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
	return res.send(await OP_DocumentTypeMaster.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
	return res.send(await OP_DocumentTypeMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
	return res.send(await OP_DocumentTypeMaster.getOneData(req.body.id));
});

// 6 = Get All Data With Department
router.get('/getAllDataDepartment', async (req, res, next) => {
	return res.send(await OP_DocumentTypeMaster.getAllDataDepartment());
});

// 7 = Get Department Doc Type
router.post('/getDepartmentDocType', async (req, res, next) => {
	return res.send(await OP_DocumentTypeMaster.getDepartmentDocType(req.body.department_id));
});

module.exports = router;
