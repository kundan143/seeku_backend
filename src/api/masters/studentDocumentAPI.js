const OP_studentDocumentMaster = require("../../operations/OP_studentDocumentMaster");

const express = require("express");
const router = express.Router();

// 1 = Get All Rows
router.get("/getAllRows", async (req, res, next) => {
  return res.send(await OP_studentDocumentMaster.getAllData());
});

// 2 = Add Row
router.post("/addRow", async (req, res, next) => {
  return res.send(await OP_studentDocumentMaster.addData(req.body));
});

// 3 = Update Row
router.post("/updateRow", async (req, res, next) => {
  return res.send(await OP_studentDocumentMaster.updateData(req.body));
});

// 4 = Delete Row
router.post("/deleteRow", async (req, res, next) => {
  return res.send(await OP_studentDocumentMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post("/getOneRow", async (req, res, next) => {
  return res.send(await OP_studentDocumentMaster.getOneData(req.body.id));
});

module.exports = router;