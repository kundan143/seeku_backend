const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EXP_HANDLE_HOST,
  port: parseInt(process.env.EXP_HANDLE_USER_PORT, 10),
  secure: true,
  auth: {
    user: process.env.EXP_HANDLE_USER_NAME,
    pass: process.env.EXP_HANDLE_USER_PASSWORD,
  },
  // Pooled connections so bulk sends (e.g. salary slip emails) reuse a small
  // number of SMTP connections instead of paying a fresh handshake per email.
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

module.exports = transporter;