const ROOT_BASE_URL_DESIGN_COSTING = '/api/designCosting';

const apiActivityLogger = require("../../services/apiActivityLogger");

module.exports = async (app, jwt) => {
    app.use(ROOT_BASE_URL_DESIGN_COSTING + '/productionDatasheet', jwt, apiActivityLogger, require('../design-costing/productionDatasheetAPI'));
    app.use(ROOT_BASE_URL_DESIGN_COSTING + '/conductorInformation', jwt, apiActivityLogger, require('../design-costing/conductorInformationAPI'));
    app.use(ROOT_BASE_URL_DESIGN_COSTING + '/insulationInformation', jwt, apiActivityLogger, require('../design-costing/insulationInformationAPI'));
    app.use(ROOT_BASE_URL_DESIGN_COSTING + '/pairingInformation', jwt, apiActivityLogger, require('../design-costing/pairingInformationAPI'));
    app.use(ROOT_BASE_URL_DESIGN_COSTING + '/armoringInformation', jwt, apiActivityLogger, require('../design-costing/armoringInformationAPI'));
    app.use(ROOT_BASE_URL_DESIGN_COSTING + '/braidingInformation', jwt, apiActivityLogger, require('../design-costing/braidingInformationAPI'));
    app.use(ROOT_BASE_URL_DESIGN_COSTING + '/innerSheathingInformation', jwt, apiActivityLogger, require('../design-costing/innerSheathingInformationAPI'));
    app.use(ROOT_BASE_URL_DESIGN_COSTING + '/outerSheathingInformation', jwt, apiActivityLogger, require('../design-costing/outerSheathingInformationAPI'));
    app.use(ROOT_BASE_URL_DESIGN_COSTING + '/laidUpInformation', jwt, apiActivityLogger, require('../design-costing/laidUpInformationAPI'));
};