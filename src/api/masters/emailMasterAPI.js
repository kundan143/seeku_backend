const OP_emailMaster = require("../../operations/OP_emailMaster");

const express = require("express");
const router = express.Router();

// 1 = Get All Rows
router.get("/getAllRows", async (req, res, next) => {
  return res.send(await OP_emailMaster.getAllData());
});

// 2 = Add Row
router.post("/addRow", async (req, res, next) => {
  return res.send(await OP_emailMaster.addData(req.body));
});

// 3 = Update Row
router.post("/updateRow", async (req, res, next) => {
  return res.send(await OP_emailMaster.updateData(req.body));
});

// 4 = Delete Row
router.post("/deleteRow", async (req, res, next) => {
  return res.send(await OP_emailMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post("/getOneRow", async (req, res, next) => {
  return res.send(await OP_emailMaster.getOneData(req.body.id));
});

module.exports = router;