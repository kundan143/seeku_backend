const OP_MenuMaster = require("../../operations/OP_MenuMaster");
const express = require('express');
const router = express.Router();

// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
	return res.send(await OP_MenuMaster.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
	return res.send(await OP_MenuMaster.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
	return res.send(await OP_MenuMaster.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
	return res.send(await OP_MenuMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
	return res.send(await OP_MenuMaster.getOneData(req.body.id));
});

// 5 = Get Parent Menus
router.get('/getParentMenus', async (req, res, next) => {
	return res.send(await OP_MenuMaster.getParentMenus());
});

module.exports = router;