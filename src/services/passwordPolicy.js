// Single source of truth for the password-rotation policy, shared by:
// - cron/jobs/enforcePasswordExpiry.js (flags must_change_password once a password is this old)
// - services/logingServiceRouter.js (computes the pre-expiry reminder shown at login)
exports.PASSWORD_MAX_AGE_DAYS = 15;
exports.PASSWORD_EXPIRY_REMINDER_DAYS = 2; // show a "expires soon" reminder inside this window
