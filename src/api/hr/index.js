const ROOT_BASE_URL_hr = '/api/hr';

module.exports = async (app, jwt) => {
    app.use(ROOT_BASE_URL_hr + '/emergencyContacts', jwt, require('../hr/emergencyContactsAPI'));
    app.use(ROOT_BASE_URL_hr + '/userLeaves', jwt, require('../hr/userLeavesAPI'));
    app.use(ROOT_BASE_URL_hr + '/employeeExpenses', jwt, require('../hr/employeeExpensesAPI'));
    app.use(ROOT_BASE_URL_hr + '/holidaysMaster', jwt, require('../hr/holidaysMasterAPI'))
};