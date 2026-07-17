const ROOT_BASE_URL_QUOTATION = '/api/quotation';

const apiActivityLogger = require("../../services/apiActivityLogger");

module.exports = async (app, jwt) => {
	app.use(ROOT_BASE_URL_QUOTATION, jwt, apiActivityLogger, require('./quotationAPI'));
};
