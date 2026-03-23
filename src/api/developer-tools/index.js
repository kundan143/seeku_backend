const ROOT_BASE_URL_DEVELOPER_TOOLS = '/api/developerTools';

module.exports = async (app, jwt) => {
	app.use(ROOT_BASE_URL_DEVELOPER_TOOLS + '/roleMaster', jwt, require('../developer-tools/roleMasterAPI'));
	app.use(ROOT_BASE_URL_DEVELOPER_TOOLS + '/menuMaster', jwt, require('../developer-tools/menuMasterAPI'));
	app.use(ROOT_BASE_URL_DEVELOPER_TOOLS + '/databaseHandler', require('../developer-tools/databaseHandlerAPI'));
	app.use(ROOT_BASE_URL_DEVELOPER_TOOLS + '/linkMenuPermission', jwt, require('../developer-tools/permissionAPI'));
	app.use(ROOT_BASE_URL_DEVELOPER_TOOLS + '/linkMaster', jwt, require('../developer-tools/linkMasterAPI'));
	// app.use(ROOT_BASE_URL_DEVELOPER_TOOLS + '/commonService', require('../developer-tools/commonServiceAPI'));
};
