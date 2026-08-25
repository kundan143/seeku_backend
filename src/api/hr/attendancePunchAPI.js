const OP_AttendancePunch = require("../../operations/OP_AttendancePunch");

const express = require('express');
const router = express.Router();


// 1 = Bulk import punches from a parsed Excel/CSV file
router.post('/bulkImport', async (req, res, next) => {
    return res.send(await OP_AttendancePunch.bulkImport(req.body));
});

// 2 = Add a single manual punch for one employee (device missed it, or no device at all)
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_AttendancePunch.addManualPunch(req.body));
});

// 4 = One employee's daily first/last punch for a given month (My Profile calendar)
router.post('/getMonthSummary', async (req, res, next) => {
    return res.send(await OP_AttendancePunch.getMonthSummaryByUser(req.body));
});

// 5 = Every employee x day in a date range (admin screen)
router.post('/getAllSummary', async (req, res, next) => {
    return res.send(await OP_AttendancePunch.getAllSummary(req.body));
});

// 5b = Company-wide Present/Late/WFH/Absent counts for today (dashboard widgets)
router.get('/getTodayStats', async (req, res, next) => {
    return res.send(await OP_AttendancePunch.getTodayStats());
});

// 5b2 = One employee's this-month Present/Absent/Late counts + today's punch status (dashboard hero stats)
router.post('/getMyDashboardStats', async (req, res, next) => {
    return res.send(await OP_AttendancePunch.getMyDashboardStats(req.body.user_id));
});

// 5c = Every employee x every day of a month, pre-classified into P/HD/WFH/A/'-' (Monthly Sheet)
router.post('/getMonthlySheet', async (req, res, next) => {
    return res.send(await OP_AttendancePunch.getMonthlySheet(req.body));
});

// 5d = Email an already-built Monthly Sheet workbook (as base64) to HR-entered addresses
router.post('/emailMonthlySheet', async (req, res, next) => {
    return res.send(await OP_AttendancePunch.emailMonthlySheet(req.body));
});

// 5e = Email the Attendance tab's currently-filtered list (as base64) to HR-entered addresses
router.post('/emailAttendanceReport', async (req, res, next) => {
    return res.send(await OP_AttendancePunch.emailAttendanceReport(req.body));
});

// 6 = All raw punches for one employee on one day (drill-down)
router.post('/getRawPunches', async (req, res, next) => {
    return res.send(await OP_AttendancePunch.getRawPunchesByUserDate(req.body));
});

// 7 = Employees + their mapped biometric device code
router.get('/getUsersWithCodes', async (req, res, next) => {
    return res.send(await OP_AttendancePunch.getUsersWithCodes());
});

// 8 = Soft-delete a wrongly imported punch
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_AttendancePunch.deleteData(req.body));
});

module.exports = router;
