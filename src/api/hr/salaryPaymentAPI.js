const OP_salaryPayment = require("../../operations/OP_salaryPayment");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_salaryPayment.getAllData());
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_salaryPayment.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_salaryPayment.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_salaryPayment.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_salaryPayment.getOneData(req.body.id));
});

// 6 = Get Rows By User ID
router.post('/getRowsByUser', async (req, res, next) => {
    return res.send(await OP_salaryPayment.getDataByUserId(req.body.user_id));
});

// 7 = Get Rows By Month & Year
router.post('/getRowsByMonthYear', async (req, res, next) => {
    return res.send(await OP_salaryPayment.getDataByMonthYear(req.body.payment_month, req.body.payment_year));
});

// 8 = Mark As Paid
router.post('/markAsPaid', async (req, res, next) => {
    return res.send(await OP_salaryPayment.markAsPaid(req.body));
});

// 9 = Preview Bulk Payroll (returns all salary records for a month/year, flagging already-processed ones)
router.post('/previewBulkPayroll', async (req, res, next) => {
    return res.send(await OP_salaryPayment.previewBulkPayroll(req.body.payment_month, req.body.payment_year));
});

// 10 = Process Bulk Payroll (bulk insert for selected employees in one transaction)
router.post('/processBulkPayroll', async (req, res, next) => {
    return res.send(await OP_salaryPayment.processBulkPayroll(req.body));
});

// 11 = Generate Salary Slip PDF and save URL
router.post('/generateSlip', async (req, res, next) => {
    return res.send(await OP_salaryPayment.generateSlip(req.body.id));
});

// 12 = Email Salary Slip to employee
router.post('/emailSlip', async (req, res, next) => {
    return res.send(await OP_salaryPayment.emailSlip(req.body.id, req.body.emails || req.body.email));
});
router.post('/bulkEmailSlips', async (req, res, next) => {
    return res.send(await OP_salaryPayment.bulkEmailSlips(req.body.ids));
});

router.post('/getDataPaymentCompleted', async (req, res, next) => {
    return res.send(await OP_salaryPayment.getDataPaymentCompleted(req.body.user_id));
});

// 13 = Get per-employee leave-day summary for a month (auto-calc defaults for single form)
router.post('/getLeaveSummary', async (req, res, next) => {
    return res.send(await OP_salaryPayment.getLeaveSummary(req.body.user_id, req.body.payment_month, req.body.payment_year));
});

module.exports = router;
