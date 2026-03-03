const OP_RelOrgCategories = require("../../operations/OP_RelOrgCategories");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
	return res.send(await OP_RelOrgCategories.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
	return res.send(await OP_RelOrgCategories.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
	return res.send(await OP_RelOrgCategories.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
	return res.send(await OP_RelOrgCategories.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
	return res.send(await OP_RelOrgCategories.getOneData(req.body.id));
});

// 6 = Add Bulk
router.post('/addBulk', async (req, res, next) => {
	return res.send(await OP_RelOrgCategories.addBulk(req.body));
});

// 7 = Get Org Categories
router.post('/getOrgCategories', async (req, res, next) => {
	return res.send(await OP_RelOrgCategories.getOrgCategories(req.body.org_id));
});
// 7 = Get Org Categories
router.post('/getOrgSubCategories', async (req, res, next) => {
	return res.send(await OP_RelOrgCategories.getOrgSubCategories(req.body.org_id));
});

module.exports = router;