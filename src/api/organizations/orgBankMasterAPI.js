const OP_OrgBankMaster = require("../../operations/OP_OrgBankMaster");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
	return res.send(await OP_OrgBankMaster.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
	return res.send(await OP_OrgBankMaster.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
	return res.send(await OP_OrgBankMaster.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
	return res.send(await OP_OrgBankMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
	return res.send(await OP_OrgBankMaster.getOneData(req.body.id));
});

// 6 = Get All Org Banks Against One Org
router.post('/getAllOrgBankAgainstOneOrg', async (req, res, next) => {
	return res.send(await OP_OrgBankMaster.getAllOrgBankAgainstOneOrg(req.body.org_id));
});

// 7 = Get All Org Banks Against One Org + Bank Type
router.post('/getAllOrgBankAgainstOneOrgType', async (req, res, next) => {
	return res.send(await OP_OrgBankMaster.getAllOrgBankAgainstOneOrgType(req.body.org_id, req.body.bank_type));
});

module.exports = router;
