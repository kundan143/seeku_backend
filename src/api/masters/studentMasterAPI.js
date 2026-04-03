const OP_StudentMaster = require("../../operations/OP_StudentMaster");

const express = require("express");
const router = express.Router();

// 1 = Get All Rows
router.post("/getAllRows", async (req, res, next) => {
  return res.send(await OP_StudentMaster.getAllData());
});

// 2 = Add Row
router.post("/addRow", async (req, res, next) => {
  return res.send(await OP_StudentMaster.addData(req.body));
});

// 3 = Update Row
router.post("/updateRow", async (req, res, next) => {
  return res.send(await OP_StudentMaster.updateData(req.body));
});

// 4 = Delete Row
router.post("/deleteRow", async (req, res, next) => {
  return res.send(await OP_StudentMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post("/getOneRow", async (req, res, next) => {
  return res.send(await OP_StudentMaster.getOneData(req.body.id));
});

module.exports = router;