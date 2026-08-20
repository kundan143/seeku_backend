const OP_CronJobs = require("../../operations/OP_CronJobs");
const express = require("express");
const router = express.Router();

// Manually trigger the monthly incentive accrual job for testing/debugging.
// Safe to re-run for the same period - the underlying job is idempotent.
router.post("/accrueEmployeeIncentiveDetails", async (req, res, next) => {
	return res.send(await OP_CronJobs.triggerAccrueEmployeeIncentiveDetails());
});

module.exports = router;
