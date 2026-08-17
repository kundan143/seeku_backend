const OP_usersSalaryDetails = require("../../operations/OP_usersSalaryDetails");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_usersSalaryDetails.getAllData(req.body));
});

// 2 = Add Row
router.post('/addRow', async (req, res, next) => {
    return res.send(await OP_usersSalaryDetails.addData(req.body));
});

// 3 = Update Row
router.post('/updateRow', async (req, res, next) => {
    return res.send(await OP_usersSalaryDetails.updateData(req.body));
});

// 4 = Delete Row
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_usersSalaryDetails.deleteData(req.body));
});

// 5 = Get One Row
router.post('/getOneRow', async (req, res, next) => {
    return res.send(await OP_usersSalaryDetails.getOneData(req.body.id));
});

// 6 = Get All Rows By User ID
router.post('/getRowsByUser', async (req, res, next) => {
    return res.send(await OP_usersSalaryDetails.getDataByUserId(req.body.user_id));
});

// 7 = Get Salary Grouped By Department/Designation
router.post('/getGroupedSalary', async (req, res, next) => {
    return res.send(await OP_usersSalaryDetails.getGroupedSalary(req.body.group_by));
});

// 8 = Apply Increment (snapshots the old salary into salary_increment_history, then saves the new one)
router.post('/applyIncrement', async (req, res, next) => {
    return res.send(await OP_usersSalaryDetails.applyIncrement(req.body));
});

// 9 = Revert Increment (restores users_salary_details from a salary_increment_history row's old_salary_snapshot)
router.post('/revertIncrement', async (req, res, next) => {
    return res.send(await OP_usersSalaryDetails.revertIncrement(req.body));
});

module.exports = router;