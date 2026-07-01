const ROOT_BASE_URL_hr = '/api/hr';

module.exports = async (app, jwt) => {
    app.use(ROOT_BASE_URL_hr + '/emergencyContacts', jwt, require('../hr/emergencyContactsAPI'));
    app.use(ROOT_BASE_URL_hr + '/userLeaves', jwt, require('../hr/userLeavesAPI'));
    app.use(ROOT_BASE_URL_hr + '/employeeExpenses', jwt, require('../hr/employeeExpensesAPI'));
    app.use(ROOT_BASE_URL_hr + '/holidaysMaster', jwt, require('../hr/holidaysMasterAPI'));
    app.use(ROOT_BASE_URL_hr + '/companyNews', jwt, require('../hr/companyNewsAPI'));
    app.use(ROOT_BASE_URL_hr + '/userLeaveBalance', jwt, require('../hr/userLeaveBalanceAPI'));
    app.use(ROOT_BASE_URL_hr + '/employeeBankDetails', jwt, require('../hr/employeeBankDetailsAPI'));
    app.use(ROOT_BASE_URL_hr + '/employeeSalaryDetails', jwt, require('../hr/usersSalaryDetailsAPI'));
    app.use(ROOT_BASE_URL_hr + '/salaryPayment', jwt, require('../hr/salaryPaymentAPI'));
    app.use(ROOT_BASE_URL_hr + '/userDocumentMaster', jwt, require('../hr/userDocumentMasterAPI'));
};