const OP_OrgContactEmail = require("../../operations/OP_OrgContactEmail");

const express = require("express");
const router = express.Router();

router.post("/getOneRow", async (req, res, next) => {
  return res.send(await OP_OrgContactEmail.getOneData(req.body.id));
});

router.post("/getOneOrgEmails", async (req, res, next) => {
  return res.send(await OP_OrgContactEmail.getOneOrgEmails(req.body.cont_id));
});

router.post("/getOneOrgAllEmails", async (req, res, next) => {
  return res.send(await OP_OrgContactEmail.getOneOrgAllEmails(req.body.org_id));
});

router.post("/addRow", async (req, res, next) => {
  return res.send(await OP_OrgContactEmail.addData(req.body));
});

router.post("/updateRow", async (req, res, next) => {
  return res.send(await OP_OrgContactEmail.updateData(req.body));
});

router.post("/deleteRow", async (req, res, next) => {
  return res.send(await OP_OrgContactEmail.deleteData(req.body));
});

module.exports = router;
