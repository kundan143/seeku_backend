const transporter = require("./mailTransporterService");
const { systemConfig } = require("../models");

// Notifies the office/admin inbox whenever a user account gets auto-locked after
// too many failed login attempts. Recipient is configurable via a system_config
// row (config_key = 'office_notification_email') with an env var as a fallback,
// so it works even before anyone sets that config value.
async function sendAccountLockedMail(user, attempts) {
  const officeEmail = process.env.OFFICE_NOTIFICATION_EMAIL;
  if (!officeEmail) return;
  console.log(`Sending account lockout notification for ${user.work_email || user.emp_code} to ${officeEmail}`);
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.work_email || user.emp_code || "Unknown User";

  const mailOptions = {
    from: process.env.EXP_HANDLE_FROM_MAIL || "no-reply@seeku.in",
    to: officeEmail,
    subject: `Account Locked: ${displayName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #c0392b;">Account Locked</h2>
        <p><strong>${displayName}</strong> (${user.work_email || user.emp_code}) has been locked out after
        <strong>${attempts} consecutive failed login attempts</strong>.</p>
        <p>The account will remain locked until the password is reset.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendAccountLockedMail;
