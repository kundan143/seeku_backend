const transporter = require("./mailTransporterService");

async function sendForgotPasswordMail(toEmail) {
  const mailOptions = {
    from: process.env.EXP_HANDLE_FROM_MAIL || "no-reply@seeku.in",
    to: toEmail,
    subject: "Account Locked - Reset Your Password",
    text: `Your account has been locked due to multiple incorrect password attempts. Please use the forgot password option to reset your password.`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendForgotPasswordMail;
