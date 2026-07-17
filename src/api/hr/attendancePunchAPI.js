const OP_AttendancePunch = require("../../operations/OP_AttendancePunch");

const express = require('express');
const router = express.Router();


// 1 = Bulk import punches from a parsed Excel/CSV file
router.post('/bulkImport', async (req, res, next) => {
    return res.send(await OP_AttendancePunch.bulkImport(req.body));
});

// 2 = One employee's daily first/last punch for a given month (My Profile calendar)
router.post('/getMonthSummary', async (req, res, next) => {
    return res.send(await OP_AttendancePunch.getMonthSummaryByUser(req.body));
});

// 3 = Every employee x day in a date range (admin screen)
router.post('/getAllSummary', async (req, res, next) => {
    return res.send(await OP_AttendancePunch.getAllSummary(req.body));
});

// 4 = All raw punches for one employee on one day (drill-down)
router.post('/getRawPunches', async (req, res, next) => {
    return res.send(await OP_AttendancePunch.getRawPunchesByUserDate(req.body));
});

// 5 = Employees + their mapped biometric device code
router.get('/getUsersWithCodes', async (req, res, next) => {
    return res.send(await OP_AttendancePunch.getUsersWithCodes());
});

// 6 = Soft-delete a wrongly imported punch
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_AttendancePunch.deleteData(req.body));
});

module.exports = router;
