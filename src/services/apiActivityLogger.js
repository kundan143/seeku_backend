const { recordApiCall } = require("../operations/OP_UserActivityLog");

module.exports = function apiActivityLogger(req, res, next) {
  recordApiCall(req).catch(() => { });
  next();
};
