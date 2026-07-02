const ROOT_BASE_URL_MASTERS = '/api/sales';

const apiActivityLogger = require("../../services/apiActivityLogger");

module.exports = async (app, jwt) => {
	app.use(ROOT_BASE_URL_MASTERS + '/salesOrder', jwt, apiActivityLogger, require('./salesOrderAPI'));
};
