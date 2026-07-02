const ROOT_BASE_URL_MASTERS = '/api/fee-management';

const apiActivityLogger = require("../../services/apiActivityLogger");

module.exports = async (app, jwt) => {
	app.use(ROOT_BASE_URL_MASTERS + '/feeStructure', jwt, apiActivityLogger, require('./feeStructureAPI'));
    app.use(ROOT_BASE_URL_MASTERS + '/feeAssignment', jwt, apiActivityLogger, require('./feeAssignmentAPI'));
};
