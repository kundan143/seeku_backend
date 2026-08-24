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

// 4 = Generate Increment Letter PDF
router.post("/generateLetter", async (req, res, next) => {
    return res.send(await OP_SalaryIncrementHistory.generateLetter(req.body.id));
});

// 5 = Email Increment Letter to the employee
router.post("/emailLetter", async (req, res, next) => {
    return res.send(await OP_SalaryIncrementHistory.emailLetter(req.body.id, req.body.to_email, req.body.sent_by, req.body.force));
});

module.exports = router;
