const OP_UserActivityLog = require("../../operations/OP_UserActivityLog");

const express = require('express');
const router = express.Router();

// 1 = Log an activity event (login / logout / page_visit)
router.post('/logEvent', async (req, res, next) => {
    return res.send(await OP_UserActivityLog.logEvent(req));
});

// 2 = Get All Rows (optionally filtered by user_id / event_type / from_date / to_date)
router.post('/getAllRows', async (req, res, next) => {
    return res.send(await OP_UserActivityLog.getAllData(req.body));
});

module.exports = router;
