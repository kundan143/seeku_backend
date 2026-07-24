const transporter = require("./mailTransporterService");

async function sendComponentLockOpenMail(toEmail, { componentName, userName, userEmail, openedAt, openCount }) {
  const mailOptions = {
    from: process.env.EXP_HANDLE_FROM_MAIL || "no-reply@seeku.in",
    to: toEmail,
    subject: `Component unlocked — ${componentName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #2d6cdf;">Component Unlocked</h2>
        <p><strong>${componentName}</strong> was unlocked by:</p>
        <p>${userName} (${userEmail})</p>
        <table style="border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 4px 12px 4px 0; color: #555;">Opened at</td><td>${openedAt.toLocaleString()}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #555;">Total times opened</td><td>${openCount}</td></tr>
        </table>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendComponentLockOpenMail;
