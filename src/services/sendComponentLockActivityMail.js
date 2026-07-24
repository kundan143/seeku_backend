const transporter = require("./mailTransporterService");

function formatDuration(ms) {
  if (ms == null || ms < 0) return "-";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

async function sendComponentLockActivityMail(toEmail, { componentName, userName, userEmail, openedAt, closedAt, durationMs, openCount }) {
  const mailOptions = {
    from: process.env.EXP_HANDLE_FROM_MAIL || "no-reply@seeku.in",
    to: toEmail,
    subject: `Activity report — ${componentName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #2d6cdf;">Component Activity Report</h2>
        <p><strong>${componentName}</strong> was accessed by:</p>
        <p>${userName} (${userEmail})</p>
        <table style="border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 4px 12px 4px 0; color: #555;">Opened at</td><td>${openedAt ? openedAt.toLocaleString() : "-"}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #555;">Closed at</td><td>${closedAt.toLocaleString()}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #555;">Session duration</td><td>${formatDuration(durationMs)}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #555;">Total times opened</td><td>${openCount}</td></tr>
        </table>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendComponentLockActivityMail;
