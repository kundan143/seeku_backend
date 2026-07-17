const OP_AttendanceRegularization = require("../../operations/OP_AttendanceRegularization");

const express = require('express');
const router = express.Router();


// 1 = Employee submits a regularization request
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_AttendanceRegularization.addData(req.body));
});

// 2 = Checker approves/rejects a request
router.post('/approvalUpdate', async (req, res, next) => {
    return res.send(await OP_AttendanceRegularization.approvalUpdateData(req.body));
});

// 3 = Employee withdraws their own pending request
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_AttendanceRegularization.deleteData(req.body));
});

// 4 = All requests (checker/admin view), optionally filtered by status
router.post('/getAllRows', async (req, res, next) => {
    return res.send(await OP_AttendanceRegularization.getAllData(req.body));
});

// 5 = One employee's own requests (My Profile)
router.post('/getByUser', async (req, res, next) => {
    return res.send(await OP_AttendanceRegularization.getByUser(req.body.user_id));
});

module.exports = router;
