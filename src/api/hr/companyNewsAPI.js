const OP_companyNewsMaster = require("../../operations/OP_companyNews");

const express = require("express");
const router = express.Router();

// 1 = Get All Rows
router.get("/getAllRows", async (req, res, next) => {
    return res.send(await OP_companyNewsMaster.getAllData());
});

// 2 = Add Row
router.post("/addRow", async (req, res, next) => {
    return res.send(await OP_companyNewsMaster.addData(req.body));
});

// 3 = Update Row
router.post("/updateRow", async (req, res, next) => {
    return res.send(await OP_companyNewsMaster.updateData(req.body));
});

// 4 = Delete Row
router.post("/deleteRow", async (req, res, next) => {
    return res.send(await OP_companyNewsMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post("/getOneRow", async (req, res, next) => {
    return res.send(await OP_companyNewsMaster.getOneData(req.body.id));
});

module.exports = router;