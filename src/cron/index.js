const { CronJob } = require("cron");
const logger = require("../services/dailyLogService");
const { updateLeaveBalanceAllocation } = require("./jobs/updateLeaveBalanceAllocation");

// Add new cron jobs here.
const jobs = [
  {
    name: "updateLeaveBalanceAllocation",
    cronTime: "1 0 1 * *", // 00:01 AM, 1st of every month
    onTick: updateLeaveBalanceAllocation,
  },
];

exports.startCronJobs = function () {
  // pm2 runs this app with `-i max` (one process per CPU core). Only start
  // cron jobs on a single instance so monthly/scheduled jobs don't fire once
  // per core.
  if (process.env.NODE_APP_INSTANCE && process.env.NODE_APP_INSTANCE !== "0") {
    return;
  }

  jobs.forEach(({ name, cronTime, onTick }) => {
    new CronJob(
      cronTime,
      async () => {
        logger.info({ message: `Cron job started: ${name}` });
        try {
          await onTick();
          logger.info({ message: `Cron job completed: ${name}` });
        } catch (e) {
          logger.error({ message: `Cron job failed: ${name}`, error: e.message });
        }
      },
      null,
      true,
      "Asia/Kolkata"
    );
    logger.info({ message: `Cron job scheduled: ${name}`, cronTime });
  });
};
