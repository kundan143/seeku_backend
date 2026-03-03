const OP_OrganizationsMaster = require("../../operations/OP_OrganizationsMaster");

const express = require("express");
const router = express.Router();

// 1 = Get All Rows
router.get("/getAllRows", async (req, res, next) => {
  return res.send(await OP_OrganizationsMaster.getAllData());
});

// 2 = Add Row
router.post("/addRow", async (req, res, next) => {
  return res.send(await OP_OrganizationsMaster.addData(req.body));
});

// 3 = Update Row
router.post("/updateRow", async (req, res, next) => {
  return res.send(await OP_OrganizationsMaster.updateData(req.body));
});

// 4 = Delete Row
router.post("/deleteRow", async (req, res, next) => {
  return res.send(await OP_OrganizationsMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post("/getOneRow", async (req, res, next) => {
  return res.send(await OP_OrganizationsMaster.getOneData(req.body.id));
});
// 5 = Get One Row
router.get("/searchOrganizations", async (req, res, next) => {
  const query = req.query.org_name;
  return res.send(await OP_OrganizationsMaster.searchOrganizations(query));
});

// 6 = Get Category Wise Org
router.post("/getCategoryWiseOrg", async (req, res, next) => {
  return res.send(await OP_OrganizationsMaster.getCategoryWiseOrg(req.body));
});

// 7 = Get Category Wise Org All Details
router.post("/getCategoryWiseOrgAllDetails", async (req, res, next) => {
  return res.send(
    await OP_OrganizationsMaster.getCategoryWiseOrgAllDetails(req.body)
  );
});

// 8 = Get Status Wise Org List
router.post("/getStatusWiseOrgList", async (req, res, next) => {
  return res.send(await OP_OrganizationsMaster.getStatusWiseOrgList(req.body));
});

// 9 = Update Org Status
router.post("/updateOrgStatus", async (req, res, next) => {
  return res.send(await OP_OrganizationsMaster.updateOrgStatus(req.body));
});

// 10 = Get Zone Wise Buyers
router.post("/getZoneWiseBuyers", async (req, res, next) => {
  return res.send(await OP_OrganizationsMaster.getZoneWiseBuyers(req.body));
});

// 10 = Update Indent Status
router.post("/updateIndentStatus", async (req, res, next) => {
  return res.send(await OP_OrganizationsMaster.updateIndentStatus(req.body));
});

// 7 = Get Category Wise Org All Details
router.post(
  "/getCategoryWiseOrgAllDetailsForIndent",
  async (req, res, next) => {
    return res.send(
      await OP_OrganizationsMaster.getCategoryWiseOrgAllDetailsForIndent(
        req.body
      )
    );
  }
);

module.exports = router;
