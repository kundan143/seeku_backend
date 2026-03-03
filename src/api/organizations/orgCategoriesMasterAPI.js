const OP_OrgCategoriesMaster = require("../../operations/OP_OrgCategoriesMaster");

const express = require('express');
const router = express.Router();

// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
	return res.send(await OP_OrgCategoriesMaster.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
	return res.send(await OP_OrgCategoriesMaster.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
	return res.send(await OP_OrgCategoriesMaster.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
	return res.send(await OP_OrgCategoriesMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
	return res.send(await OP_OrgCategoriesMaster.getOneData(req.body.id));
});
router.post('/getCatCreditDebitNote', async (req, res, next) => {
	return res.send(await OP_OrgCategoriesMaster.getCatCreditDebitNote(req.body.is_cd_note));
});

module.exports = router;