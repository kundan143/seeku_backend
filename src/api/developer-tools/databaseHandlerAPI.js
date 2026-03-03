const OP_DatabaseHandler = require("../../operations/OP_DatabaseHandler");
const express = require('express');
const router = express.Router();

// 1 = Get All Tables
router.get('/getAllTables', async (req, res, next) => {
	return res.send(await OP_DatabaseHandler.getAllTables());
});

// 2 = Create Model
router.post('/createModel', async (req, res, next) => {
	return res.send(await OP_DatabaseHandler.createModel(req.body));
});
// 1 = Get All Tables
router.post('/getOneTableDetails', async (req, res, next) => {
	return res.send(await OP_DatabaseHandler.getOneTableDetails(req.body));
});

module.exports = router;
