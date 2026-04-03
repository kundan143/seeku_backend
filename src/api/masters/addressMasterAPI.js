const OP_addressMaster = require("../../operations/OP_addressMaster");

const express = require("express");
const router = express.Router();

// 1 = Get All Rows
router.post("/getAllRows", async (req, res, next) => {
  return res.send(await OP_addressMaster.getAllData(req.body));
});

// 2 = Add Row
router.post("/addRow", async (req, res, next) => {
  return res.send(await OP_addressMaster.addData(req.body));
});

// 3 = Update Row
router.post("/updateRow", async (req, res, next) => {
  return res.send(await OP_addressMaster.updateData(req.body));
});

// 4 = Delete Row
router.post("/deleteRow", async (req, res, next) => {
  return res.send(await OP_addressMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post("/getOneRow", async (req, res, next) => {
  return res.send(await OP_addressMaster.getOneData(req.body.id));
});

module.exports = router;