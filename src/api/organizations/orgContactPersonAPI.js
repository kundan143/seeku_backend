const OP_OrgContactPerson = require("../../operations/OP_OrgContactPerson");

const express = require("express");
const router = express.Router();

router.get("/getAllRows", async (req, res, next) => {
  return res.send(await OP_OrgContactPerson.getAllData());
});

router.post("/getOneRow", async (req, res, next) => {
  return res.send(await OP_OrgContactPerson.getOneData(req.body.id));
});

router.post("/getOrgContactPersons", async (req, res, next) => {
  return res.send(await OP_OrgContactPerson.getOrgContactPersons(req.body.org_id));
});

router.post("/addRow", async (req, res, next) => {
  return res.send(await OP_OrgContactPerson.addData(req.body));
});

router.post("/addPersonContactEmail", async (req, res, next) => {
  return res.send(await OP_OrgContactPerson.addPersonContactEmail(req.body));
});

router.post("/updateRow", async (req, res, next) => {
  return res.send(await OP_OrgContactPerson.updateData(req.body));
});

router.post("/deleteRow", async (req, res, next) => {
  return res.send(await OP_OrgContactPerson.deleteData(req.body));
});

module.exports = router;
