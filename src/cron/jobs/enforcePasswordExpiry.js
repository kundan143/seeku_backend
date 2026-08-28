const { usersMaster } = require("../../models");
const { Op } = require("sequelize");
const logger = require("../../services/dailyLogService");
const { PASSWORD_MAX_AGE_DAYS } = require("../../services/passwordPolicy");

// Runs daily: any active employee whose password is 15+ days old (or who has never changed it -
// last_password_modified is only ever set inside OP_UsersMaster.updatePassword) gets
// must_change_password flipped true. That flag is already fully enforced elsewhere - the login
// flow blocks the dashboard redirect with a forced-change dialog (login.component.ts), and
// AuthGuard independently re-checks it against direct navigation - so this job's only job is to
// re-arm that existing flag on a rolling 15-day cycle, not to build a second enforcement path.
exports.enforcePasswordExpiry = async function () {
  try {
    const cutoff = new Date(Date.now() - PASSWORD_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);

    const [rowsUpdated] = await usersMaster.update(
      { must_change_password: true },
      {
        where: {
          status: true,
          must_change_password: false,
          [Op.or]: [
            { last_password_modified: null },
            { last_password_modified: { [Op.lt]: cutoff } },
          ],
        },
      }
    );

    logger.info({
      message: "enforcePasswordExpiry: flagged users past the 15-day password age limit",
      rowsUpdated,
    });
  } catch (e) {
    logger.error({
      message: "enforcePasswordExpiry: failed to flag expired passwords",
      error: e.message,
    });
    throw e;
  }
};
