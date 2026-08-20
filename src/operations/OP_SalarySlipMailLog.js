const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

exports.getAllData = async function () {
  try {
    const query = `select sml.*, concat(eu.first_name, ' ', eu.last_name) as employee_name,
                    concat(su.first_name, ' ', su.last_name) as sent_by_name
                  from salary_slip_mail_log sml
                  join users_master eu on eu.id = sml.user_id
                  left join users_master su on su.id = sml.sent_by
                  order by sml.sent_date desc, sml.id desc;`;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
