const OP_CityMaster = require("../../operations/OP_CityMaster");

const express = require("express");
const router = express.Router();

// 1 = Get All Rows
router.get("/getAllRows", async (req, res, next) => {
  return res.send(await OP_CityMaster.getAllData());
});

// 2 = Add Row
router.post("/addRow", async (req, res, next) => {
  return res.send(await OP_CityMaster.addData(req.body));
});

// 3 = Update Row
router.post("/updateRow", async (req, res, next) => {
  return res.send(await OP_CityMaster.updateData(req.body));
});

// 4 = Delete Row
router.post("/deleteRow", async (req, res, next) => {
  return res.send(await OP_CityMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post("/getOneRow", async (req, res, next) => {
  return res.send(await OP_CityMaster.getOneData(req.body.id));
});

// 6 = Get State Cities
router.post("/getStateCities", async (req, res, next) => {
  return res.send(await OP_CityMaster.getStateCities(req.body.state_id));
});
// 6 = Get State Cities
router.get("/searchCity", async (req, res, next) => {
  const query = req.query.city;
  return res.send(await OP_CityMaster.searchCity(query));
});

module.exports = router;
