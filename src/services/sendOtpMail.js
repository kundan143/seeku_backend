const transporter = require("./mailTransporterService");

async function sendOtpMail(toEmail, otp, expiryMinutes) {
  const mailOptions = {
    from: process.env.EXP_HANDLE_FROM_MAIL || "no-reply@seeku.in",
    to: toEmail,
    subject: "Your Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #2d6cdf;">Password Reset Request</h2>
        <p>Use the OTP below to reset your password. It is valid for <strong>${expiryMinutes} minutes</strong>.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px 24px; background: #f4f6fb; border-radius: 8px; display: inline-block; margin: 16px 0;">
          ${otp}
        </div>
        <p>If you did not request this, please ignore this email. Your account is safe.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendOtpMail;
