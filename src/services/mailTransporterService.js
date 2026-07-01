const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EXP_HANDLE_HOST,
  port: parseInt(process.env.EXP_HANDLE_USER_PORT, 10),
  secure: true,
  auth: {
    user: process.env.EXP_HANDLE_USER_NAME,
    pass: process.env.EXP_HANDLE_USER_PASSWORD,
  },
});

module.exports = transporter;