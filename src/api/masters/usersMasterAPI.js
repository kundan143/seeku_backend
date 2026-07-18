const OP_UsersMaster = require("../../operations/OP_UsersMaster");
const { canAccessUserRecord } = require("../../services/profileAccess");
const { responseCodes } = require("../../services/baseReponse");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.post('/getAllRows', async (req, res, next) => {
	return res.send(await OP_UsersMaster.getAllData(req.body));
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
	return res.send(await OP_UsersMaster.addData(req.body));
});

// Bulk import — takes the whole parsed row array in one request
router.post('/bulkImport', async (req, res, next) => {
	return res.send(await OP_UsersMaster.bulkImport(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
	return res.send(await OP_UsersMaster.updateData(req.body));
});

// Assign Role — sets the user's role_id and resets their permissions to
// that role's template
router.post('/assignRole', async (req, res, next) => {
	return res.send(await OP_UsersMaster.assignRole(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
	return res.send(await OP_UsersMaster.deleteData(req.body));
});

// 5 = Get One Row — only the record owner or someone with Employee Master
// view/edit access may fetch an arbitrary user's profile
router.post('/getOneRow', async (req, res, next) => {
	if (!(await canAccessUserRecord(req.headers.userId, req.body.id))) {
		return res.send(responseCodes.FORBIDDEN);
	}
	return res.send(await OP_UsersMaster.getOneData(req.body.id));
});

// 6 = Get Role Wise Users
router.post('/getRoleWiseUsers', async (req, res, next) => {
	return res.send(await OP_UsersMaster.getRoleWiseUsers(req.body));
});

// 7 = Update Token
router.post('/updateToken', async (req, res, next) => {
	return res.send(await OP_UsersMaster.updateToken(req.body));
});

// 8 = Get Tokens
router.post('/getTokens', async (req, res, next) => {
	return res.send(await OP_UsersMaster.getTokens(req.body));
});
router.get('/getActiveUsers', async (req, res, next) => {
	return res.send(await OP_UsersMaster.getActiveUsers());
});
router.post('/getActiveUsersById', async (req, res, next) => {
	return res.send(await OP_UsersMaster.getActiveUsersById(req.body));
});
router.post('/updatePassword', async (req, res, next) => {
	return res.send(await OP_UsersMaster.updatePassword(req.body));
});
router.post('/permissionUser', async (req, res, next) => {
	return res.send(await OP_UsersMaster.permissionUser(req.body));
});
router.get('/getCompanyHierarchy', async (req, res, next) => {
	return res.send(await OP_UsersMaster.getCompanyHierarchy());
});
router.get('/getEmpName', async (req, res, next) => {
	return res.send(await OP_UsersMaster.getEmpName());
});
router.get('/getUserEmails', async (req, res, next) => {
	return res.send(await OP_UsersMaster.getUserEmails());
});
router.post('/updateBiometricCode', async (req, res, next) => {
	return res.send(await OP_UsersMaster.updateBiometricCode(req.body));
});


module.exports = router;