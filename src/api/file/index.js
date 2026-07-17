const ROOT_BASE_URL_FILE = '/api/file';

const apiActivityLogger = require("../../services/apiActivityLogger");

module.exports = async (app, jwt) => {
	app.use(ROOT_BASE_URL_FILE, jwt, apiActivityLogger, require('./fileAPI'));
};
