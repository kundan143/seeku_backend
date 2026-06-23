const OP_userLeaveBalanceMaster = require("../../operations/OP_userLeaveBalance");

const express = require("express");
const router = express.Router();

// 1 = Get All Rows
router.get("/getAllRows", async (req, res, next) => {
    return res.send(await OP_userLeaveBalanceMaster.getAllData());
});

// 2 = Add Row
router.post("/addRow", async (req, res, next) => {
    return res.send(await OP_userLeaveBalanceMaster.addData(req.body));
});

// 3 = Update Row
router.post("/updateRow", async (req, res, next) => {
    return res.send(await OP_userLeaveBalanceMaster.updateData(req.body));
});

// 4 = Delete Row
router.post("/deleteRow", async (req, res, next) => {
    return res.send(await OP_userLeaveBalanceMaster.deleteData(req.body));
});

// 5 = Get One Row
router.post("/getOneRow", async (req, res, next) => {
    return res.send(await OP_userLeaveBalanceMaster.getOneData(req.body.id));
});

router.post("/getTotalRemainingLeave", async (req, res, next) => {
    return res.send(await OP_userLeaveBalanceMaster.getTotalRemainingLeave(req.body.id));
});

module.exports = router;