const OP_SalaryIncrementHistory = require("../../operations/OP_SalaryIncrementHistory");

const express = require("express");
const router = express.Router();

// 1 = Get All Rows
router.get("/getAllRows", async (req, res, next) => {
    return res.send(await OP_SalaryIncrementHistory.getAllData());
});

// 2 = Get One Row
router.post("/getOneRow", async (req, res, next) => {
    return res.send(await OP_SalaryIncrementHistory.getOneData(req.body.id));
});

// 3 = Get Rows By User ID
router.post("/getRowsByUser", async (req, res, next) => {
    return res.send(await OP_SalaryIncrementHistory.getDataByUserId(req.body.user_id));
});

module.exports = router;
