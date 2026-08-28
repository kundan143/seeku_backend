const { CronJob } = require("cron");
const logger = require("../services/dailyLogService");
const { updateLeaveBalanceAllocation } = require("./jobs/updateLeaveBalanceAllocation");
const { accrueEmployeeIncentiveDetails } = require("./jobs/accrueEmployeeIncentiveDetails");
const { enforcePasswordExpiry } = require("./jobs/enforcePasswordExpiry");

// Add new cron jobs here.
const jobs = [
  {
    name: "updateLeaveBalanceAllocation",
    cronTime: "1 0 1 * *", // 00:01 AM, 1st of every month
    onTick: updateLeaveBalanceAllocation,
  },
  {
    name: "accrueEmployeeIncentiveDetails",
    cronTime: "5 0 1 * *", // 00:05 AM, 1st of every month
    onTick: accrueEmployeeIncentiveDetails,
  },
  {
    name: "enforcePasswordExpiry",
    cronTime: "10 0 * * *", // 00:10 AM, every day
    onTick: enforcePasswordExpiry,
    // Also runs once immediately on every server start (see startCronJobs below), not just at
    // its scheduled time - safe to leave in permanently (unlike a monthly accrual job, this one
    // is idempotent: re-checking/re-flagging already-stale passwords on a redundant run is a
    // no-op, not a double-charge), and it's what makes this job easy to test without waiting
    // for 00:10 AM - just restart the backend.
    // runOnStart: true,
  },
];

exports.startCronJobs = function () {
  // pm2 runs this app with `-i max` (one process per CPU core). Only start
  // cron jobs on a single instance so monthly/scheduled jobs don't fire once
  // per core.
  if (process.env.NODE_APP_INSTANCE && process.env.NODE_APP_INSTANCE !== "0") {
    return;
  }

  jobs.forEach(({ name, cronTime, onTick, runOnStart }) => {
    const runJob = async () => {
      logger.info({ message: `Cron job started: ${name}` });
      try {
        await onTick();
        logger.info({ message: `Cron job completed: ${name}` });
      } catch (e) {
        logger.error({ message: `Cron job failed: ${name}`, error: e.message });
      }
    };

    new CronJob(cronTime, runJob, null, true, "Asia/Kolkata");
    logger.info({ message: `Cron job scheduled: ${name}`, cronTime });

    if (runOnStart) {
      runJob();
    }
  });
};
