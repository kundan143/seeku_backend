const OP_SalarySlipMailLog = require("../../operations/OP_SalarySlipMailLog");

const express = require("express");
const router = express.Router();

// 1 = Get All Rows
router.get("/getAllRows", async (req, res, next) => {
    return res.send(await OP_SalarySlipMailLog.getAllData());
});

module.exports = router;
