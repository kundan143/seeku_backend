const OP_loanAdvanceRequest = require("../../operations/OP_loanAdvanceRequest");
const { canAccessUserRecord } = require("../../services/profileAccess");
const { responseCodes } = require("../../services/baseReponse");

const express = require('express');
const router = express.Router();

// 1 = Get All Rows
router.post('/getAllRows', async (req, res, next) => {
    return res.send(await OP_loanAdvanceRequest.getAllData(req.body));
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_loanAdvanceRequest.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_loanAdvanceRequest.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_loanAdvanceRequest.deleteData(req.body));
});

// 5 = Get One Row — id here is the target employee's id, so only the
// record owner or Employee Master view/edit access may fetch it
router.post('/getOneRow', async (req, res, next) => {
    if (!(await canAccessUserRecord(req.headers.userId, req.body.id))) {
        return res.send(responseCodes.FORBIDDEN);
    }
    return res.send(await OP_loanAdvanceRequest.getOneData(req.body.id));
});

// 6 = Record a payment/deduction against a loan (ledger entry + total_paid bump)
router.post('/recordPayment', async (req, res, next) => {
    return res.send(await OP_loanAdvanceRequest.recordPayment(req.body));
});

// 7 = Get the full payment history for a loan
router.post('/getPaymentHistory', async (req, res, next) => {
    return res.send(await OP_loanAdvanceRequest.getPaymentHistory(req.body.loan_advance_request_id));
});

module.exports = router;
