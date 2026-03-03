const ROOT_BASE_URL_MASTERS = '/api/sales';

module.exports = async (app, jwt) => {
	app.use(ROOT_BASE_URL_MASTERS + '/salesOrder', jwt, require('./salesOrderAPI'));
};
