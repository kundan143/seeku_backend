const ROOT_BASE_URL_MASTERS = '/api/fee-management';

module.exports = async (app, jwt) => {
	app.use(ROOT_BASE_URL_MASTERS + '/feeStructure', jwt, require('./feeStructureAPI'));
    app.use(ROOT_BASE_URL_MASTERS + '/feeAssignment', jwt, require('./feeAssignmentAPI'));
};
