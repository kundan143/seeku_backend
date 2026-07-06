const OP_OrgContactNumbers = require("../../operations/OP_OrgContactNumbers");

const express = require("express");
const router = express.Router();

router.post("/getOneRow", async (req, res, next) => {
  return res.send(await OP_OrgContactNumbers.getOneData(req.body.id));
});

router.post("/getOneOrgAllNumbers", async (req, res, next) => {
  return res.send(await OP_OrgContactNumbers.getOneOrgAllNumbers(req.body.org_id));
});

router.post("/addRow", async (req, res, next) => {
  return res.send(await OP_OrgContactNumbers.addData(req.body));
});

router.post("/updateRow", async (req, res, next) => {
  return res.send(await OP_OrgContactNumbers.updateData(req.body));
});

router.post("/deleteRow", async (req, res, next) => {
  return res.send(await OP_OrgContactNumbers.deleteData(req.body));
});

module.exports = router;
