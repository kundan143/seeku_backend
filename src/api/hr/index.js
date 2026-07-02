const ROOT_BASE_URL_hr = '/api/hr';

const apiActivityLogger = require("../../services/apiActivityLogger");

module.exports = async (app, jwt) => {
    app.use(ROOT_BASE_URL_hr + '/emergencyContacts', jwt, apiActivityLogger, require('../hr/emergencyContactsAPI'));
    app.use(ROOT_BASE_URL_hr + '/userLeaves', jwt, apiActivityLogger, require('../hr/userLeavesAPI'));
    app.use(ROOT_BASE_URL_hr + '/employeeExpenses', jwt, apiActivityLogger, require('../hr/employeeExpensesAPI'));
    app.use(ROOT_BASE_URL_hr + '/holidaysMaster', jwt, apiActivityLogger, require('../hr/holidaysMasterAPI'));
    app.use(ROOT_BASE_URL_hr + '/companyNews', jwt, apiActivityLogger, require('../hr/companyNewsAPI'));
    app.use(ROOT_BASE_URL_hr + '/userLeaveBalance', jwt, apiActivityLogger, require('../hr/userLeaveBalanceAPI'));
    app.use(ROOT_BASE_URL_hr + '/employeeBankDetails', jwt, apiActivityLogger, require('../hr/employeeBankDetailsAPI'));
    app.use(ROOT_BASE_URL_hr + '/employeeSalaryDetails', jwt, apiActivityLogger, require('../hr/usersSalaryDetailsAPI'));
    app.use(ROOT_BASE_URL_hr + '/salaryPayment', jwt, apiActivityLogger, require('../hr/salaryPaymentAPI'));
    app.use(ROOT_BASE_URL_hr + '/userDocumentMaster', jwt, apiActivityLogger, require('../hr/userDocumentMasterAPI'));
    app.use(ROOT_BASE_URL_hr + '/candidates', jwt, apiActivityLogger, require('../hr/candidatesAPI'));
};