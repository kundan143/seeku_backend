const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");

const dailyRotateTransport = new transports.DailyRotateFile({
  filename: "logs/app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
});

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    dailyRotateTransport
  ]
});

module.exports = logger;