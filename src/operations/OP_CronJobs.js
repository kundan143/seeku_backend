const { responseCodes } = require("../services/baseReponse");
const { accrueEmployeeIncentiveDetails } = require("../cron/jobs/accrueEmployeeIncentiveDetails");

exports.triggerAccrueEmployeeIncentiveDetails = async function () {
  try {
    const result = await accrueEmployeeIncentiveDetails();
    responseCodes.SUCCESS.data = result;
    responseCodes.SUCCESS.message = "Incentive accrual job executed successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e.message;
    responseCodes.BAD_REQUEST.message = "Failed to execute incentive accrual job";
    return responseCodes.BAD_REQUEST;
  }
};
