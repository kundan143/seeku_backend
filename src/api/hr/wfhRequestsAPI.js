const OP_WfhRequests = require("../../operations/OP_WfhRequests");

const express = require('express');
const router = express.Router();


// 1 = Employee submits a WFH request (starts Pending)
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_WfhRequests.addData(req.body));
});

// 2 = HR/admin marks one or more employees WFH directly for a set of dates (auto-approved)
router.post('/addDirect', async (req, res, next) => {
    return res.send(await OP_WfhRequests.addDirect(req.body));
});

// 3 = Checker approves/rejects a request
router.post('/approvalUpdate', async (req, res, next) => {
    return res.send(await OP_WfhRequests.approvalUpdateData(req.body));
});

// 4 = Employee withdraws their own pending request
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_WfhRequests.deleteData(req.body));
});

// 5 = All requests (checker/admin view), optionally filtered by status
router.post('/getAllRows', async (req, res, next) => {
    return res.send(await OP_WfhRequests.getAllData(req.body));
});

// 6 = One employee's own requests (My Profile)
router.post('/getByUser', async (req, res, next) => {
    return res.send(await OP_WfhRequests.getByUser(req.body.user_id));
});

module.exports = router;
