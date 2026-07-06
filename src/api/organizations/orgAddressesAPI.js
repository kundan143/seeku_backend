const OP_OrgAddresses = require("../../operations/OP_OrgAddresses");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
	return res.send(await OP_OrgAddresses.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
	return res.send(await OP_OrgAddresses.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
	return res.send(await OP_OrgAddresses.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
	return res.send(await OP_OrgAddresses.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
	return res.send(await OP_OrgAddresses.getOneData(req.body.id));
});

// 6 = Get One Row (joined with country/state/city)
router.post('/getOneData', async (req, res, next) => {
	return res.send(await OP_OrgAddresses.getOneDetailData(req.body.id));
});

// 7 = Update Active/Inactive Status
router.post('/updateStatus', async (req, res, next) => {
	return res.send(await OP_OrgAddresses.updateStatus(req.body));
});

// 8 = Get All Addresses Against One Org
router.post('/getAllAddressAginstOneOrg', async (req, res, next) => {
	return res.send(await OP_OrgAddresses.getAddressesAginstOneOrg(req.body.org_id));
});

// 9 = Get Addresses Against One Org
router.post('/getAddressesAginstOneOrg', async (req, res, next) => {
	return res.send(await OP_OrgAddresses.getAddressesAginstOneOrg(req.body.org_id));
});

// 10 = Get Zip Details
router.post('/getZipDetails', async (req, res, next) => {
	return res.send(await OP_OrgAddresses.getZipDetails(req.body.zipcode));
});

module.exports = router;
