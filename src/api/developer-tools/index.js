const ROOT_BASE_URL_DEVELOPER_TOOLS = '/api/developerTools';

const apiActivityLogger = require("../../services/apiActivityLogger");

module.exports = async (app, jwt) => {
	app.use(ROOT_BASE_URL_DEVELOPER_TOOLS + '/roleMaster', jwt, apiActivityLogger, require('../developer-tools/roleMasterAPI'));
	app.use(ROOT_BASE_URL_DEVELOPER_TOOLS + '/menuMaster', jwt, apiActivityLogger, require('../developer-tools/menuMasterAPI'));
	app.use(ROOT_BASE_URL_DEVELOPER_TOOLS + '/databaseHandler', apiActivityLogger, require('../developer-tools/databaseHandlerAPI'));
	app.use(ROOT_BASE_URL_DEVELOPER_TOOLS + '/linkMenuPermission', jwt, apiActivityLogger, require('../developer-tools/permissionAPI'));
	app.use(ROOT_BASE_URL_DEVELOPER_TOOLS + '/rolePermission', jwt, apiActivityLogger, require('../developer-tools/rolePermissionAPI'));
	app.use(ROOT_BASE_URL_DEVELOPER_TOOLS + '/linkMaster', jwt, apiActivityLogger, require('../developer-tools/linkMasterAPI'));
	app.use(ROOT_BASE_URL_DEVELOPER_TOOLS + '/userActivityLog', jwt, apiActivityLogger, require('../developer-tools/userActivityLogAPI'));
	app.use(ROOT_BASE_URL_DEVELOPER_TOOLS + '/passwordUtil', jwt, apiActivityLogger, require('../developer-tools/passwordUtilAPI'));
	// app.use(ROOT_BASE_URL_DEVELOPER_TOOLS + '/commonService', require('../developer-tools/commonServiceAPI'));
};
