const masters = require("./relations/masters");
const developer_tools = require("./relations/developer_tools");
const organizations = require("./relations/organizations");
const design_costs = require("./relations/design_costing");
const sales = require("./relations/sales");
const hr = require("./relations/hr");
const fee_management = require("./relations/fee_management");

const db = {
    ...developer_tools,
    ...masters,
    ...organizations,
    ...hr,
    ...sales,
    ...design_costs,
    ...fee_management
};

module.exports = db;