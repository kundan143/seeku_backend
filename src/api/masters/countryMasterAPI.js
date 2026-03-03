const OP_CountryMaster = require("../../operations/OP_CountryMaster");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
	return res.send(await OP_CountryMaster.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
	return res.send(await OP_CountryMaster.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
	return res.send(await OP_CountryMaster.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
	return res.send(await OP_CountryMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
	return res.send(await OP_CountryMaster.getOneData(req.body.id));
});

router.get("/searchCountry", async (req, res, next) => {
  const query = req.query.country;
  return res.send(await OP_CountryMaster.searchCountry(query));
});

module.exports = router;