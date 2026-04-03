const OP_academicMaster = require("../../operations/OP_academicMaster");

const express = require("express");
const router = express.Router();

// 1 = Get All Rows
router.post("/getAllRows", async (req, res, next) => {
  return res.send(await OP_academicMaster.getAllData(req.body));
});

// 2 = Add Row
router.post("/addRow", async (req, res, next) => {
  return res.send(await OP_academicMaster.addData(req.body));
});

// 3 = Update Row
router.post("/updateRow", async (req, res, next) => {
  return res.send(await OP_academicMaster.updateData(req.body));
});

// 4 = Delete Row
router.post("/deleteRow", async (req, res, next) => {
  return res.send(await OP_academicMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post("/getOneRow", async (req, res, next) => {
  return res.send(await OP_academicMaster.getOneData(req.body.id));
});

module.exports = router;