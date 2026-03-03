const OP_UsersMaster = require("../../operations/OP_UsersMaster");

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

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
	return res.send(await OP_UsersMaster.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
	return res.send(await OP_UsersMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
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

module.exports = router;