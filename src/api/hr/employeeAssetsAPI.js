const OP_employeeAssets = require("../../operations/OP_employeeAssets");

const express = require('express');
const router = express.Router();


// 1 = Get All Rows (every asset + its current assignment, if any)
router.get('/getAllRows', async (req, res, next) => {
    return res.send(await OP_employeeAssets.getAllData());
});

// 2 = Assign an asset to an employee
router.post('/assign', async (req, res, next) => {
    return res.send(await OP_employeeAssets.assignAsset(req.body));
});

// 3 = Return an assigned asset
router.post('/returnAsset', async (req, res, next) => {
    return res.send(await OP_employeeAssets.returnAsset(req.body));
});

// 4 = Get assignment history for one asset
router.post('/getHistory', async (req, res, next) => {
    return res.send(await OP_employeeAssets.getHistory(req.body.asset_id));
});

// 5 = Delete an assignment record
router.post('/deleteRow', async (req, res, next) => {
    return res.send(await OP_employeeAssets.deleteData(req.body));
});

// 6 = Get currently assigned assets for one employee
router.post('/getByUser', async (req, res, next) => {
    return res.send(await OP_employeeAssets.getByUser(req.body.user_id));
});

module.exports = router;
