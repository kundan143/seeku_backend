const masters = require("./relations/masters");
const developer_tools = require("./relations/developer_tools");
const organizations = require("./relations/organizations");
const design_costs = require("./relations/design_costing");
const sales = require("./relations/sales");
const hr = require("./relations/hr");

const db = {
    ...developer_tools,
    ...masters,
    ...organizations,
    ...hr,
    ...sales,
    ...design_costs
};

module.exports = db;