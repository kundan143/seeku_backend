const OP_AttendancePolicy = require("../../operations/OP_AttendancePolicy");

const express = require('express');
const router = express.Router();


// 1 = Add a new policy version
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_AttendancePolicy.addData(req.body));
});

// 2 = Edit a not-yet-effective policy version
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_AttendancePolicy.updateData(req.body));
});

// 3 = Delete a not-yet-effective policy version
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_AttendancePolicy.deleteData(req.body));
});

// 4 = All policy versions (history)
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_AttendancePolicy.getAllData());
});

// 5 = The policy currently in effect
router.get('/getCurrent', async (req, res, next) => {
    return res.send(await OP_AttendancePolicy.getCurrent());
});

module.exports = router;
