const ROOT_BASE_URL_ORGANIZATION = '/api/organization';

const apiActivityLogger = require("../../services/apiActivityLogger");

module.exports = async (app, jwt) => {
	app.use(ROOT_BASE_URL_ORGANIZATION + '/organizationsMaster', jwt, apiActivityLogger, require('../organizations/organizationsMasterAPI'));
	app.use(ROOT_BASE_URL_ORGANIZATION + '/orgCategoriesMaster', jwt ,apiActivityLogger, require('../organizations/orgCategoriesMasterAPI'));
	app.use(ROOT_BASE_URL_ORGANIZATION + '/relOrgCategories', jwt ,apiActivityLogger, require('../organizations/relOrgCategoriesAPI'));
	app.use(ROOT_BASE_URL_ORGANIZATION + '/orgAddresses', jwt ,apiActivityLogger, require('../organizations/orgAddressesAPI'));
	app.use(ROOT_BASE_URL_ORGANIZATION + '/orgBankMaster', jwt ,apiActivityLogger, require('../organizations/orgBankMasterAPI'));
	app.use(ROOT_BASE_URL_ORGANIZATION + '/orgContactPerson', jwt ,apiActivityLogger, require('../organizations/orgContactPersonAPI'));
	app.use(ROOT_BASE_URL_ORGANIZATION + '/orgContactNumbers', jwt ,apiActivityLogger, require('../organizations/orgContactNumbersAPI'));
	app.use(ROOT_BASE_URL_ORGANIZATION + '/orgContactEmail', jwt ,apiActivityLogger, require('../organizations/orgContactEmailAPI'));
	app.use(ROOT_BASE_URL_ORGANIZATION + '/relOrgDocumentType', jwt ,apiActivityLogger, require('../organizations/relOrgDocumentTypeAPI'));
	// app.use(ROOT_BASE_URL_ORGANIZATION + '/relOrgGradeMaster', jwt ,log, require('../organizations/relOrgGradeMaster'));
	// app.use(ROOT_BASE_URL_ORGANIZATION + '/orgContacts', jwt ,log, require('../organizations/orgContactsAPI'));
};
