const ROOT_BASE_URL_DESIGN_COSTING = '/api/designCosting';

module.exports = async (app, jwt) => {
    app.use(ROOT_BASE_URL_DESIGN_COSTING + '/productionDatasheet', jwt, require('../design-costing/productionDatasheetAPI'));
    app.use(ROOT_BASE_URL_DESIGN_COSTING + '/conductorInformation', jwt, require('../design-costing/conductorInformationAPI'));
    app.use(ROOT_BASE_URL_DESIGN_COSTING + '/insulationInformation', jwt, require('../design-costing/insulationInformationAPI'));
    app.use(ROOT_BASE_URL_DESIGN_COSTING + '/pairingInformation', jwt, require('../design-costing/pairingInformationAPI'));
    app.use(ROOT_BASE_URL_DESIGN_COSTING + '/armoringInformation', jwt, require('../design-costing/armoringInformationAPI'));
    app.use(ROOT_BASE_URL_DESIGN_COSTING + '/braidingInformation', jwt, require('../design-costing/braidingInformationAPI'));
    app.use(ROOT_BASE_URL_DESIGN_COSTING + '/innerSheathingInformation', jwt, require('../design-costing/innerSheathingInformationAPI'));
    app.use(ROOT_BASE_URL_DESIGN_COSTING + '/outerSheathingInformation', jwt, require('../design-costing/outerSheathingInformationAPI'));
    app.use(ROOT_BASE_URL_DESIGN_COSTING + '/laidUpInformation', jwt, require('../design-costing/laidUpInformationAPI'));
};