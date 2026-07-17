const moment = require("moment-timezone");
const { attendanceRegularization } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

const REGULARIZATION_WINDOW_DAYS = 3;

exports.addData = async function (body) {
  try {
    const today = moment.tz("Asia/Kolkata").startOf("day");
    const minDate = today.clone().subtract(REGULARIZATION_WINDOW_DAYS, "days");
    const punchDate = moment.tz(body.data.punch_date, "Asia/Kolkata").startOf("day");
    if (!punchDate.isValid() || punchDate.isBefore(minDate) || punchDate.isAfter(today)) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = `You can only regularize attendance from the last ${REGULARIZATION_WINDOW_DAYS} days.`;
      return responseCodes.BAD_REQUEST;
    }

    const result = await attendanceRegularization.create(body.data);
    responseCodes.SUCCESS.data = result.id;
    responseCodes.SUCCESS.message = "Regularization Request Submitted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = e?.parent?.code === '23505'
      ? "A request for this date is already pending or approved."
      : "Failed to Submit Regularization Request";
    return responseCodes.BAD_REQUEST;
  }
};

exports.approvalUpdateData = async function (body) {
  try {
    await attendanceRegularization.update(body.data, { where: { id: body.id } });
    responseCodes.SUCCESS.data = body.id;
    responseCodes.SUCCESS.message = "Regularization Request Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Regularization Request";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  try {
    await attendanceRegularization.update(body.data, { where: { id: body.id } });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Regularization Request Withdrawn Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Withdraw Regularization Request";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getAllData = async function (body) {
  try {
    const bodyStatus = (body && body.status !== undefined && body.status !== null) ? `ar.status = ${Number(body.status)} and` : "";
    const query = `select ar.*, concat(emp.first_name, ' ', emp.last_name) as employee_name,
                    case
                      when ar.status = 0 then 'Pending'
                      when ar.status = 1 then 'Approved'
                      when ar.status = 2 then 'Rejected'
                      else 'Unknown'
                    end as status_name,
                    case
                      when ar.status = 0 then concat(cu.first_name, ' ', cu.last_name)
                      when ar.status = 1 then concat(au.first_name, ' ', au.last_name)
                      when ar.status = 2 then concat(ru.first_name, ' ', ru.last_name)
                      else ''
                    end as action_by_name,
                    case
                      when ar.status = 0 then ar.created_date
                      when ar.status = 1 then ar.approved_date
                      when ar.status = 2 then ar.rejected_date
                      else null
                    end as action_by_date
                  from attendance_regularization ar
                  join users_master emp on emp.id = ar.user_id
                  left join users_master cu on cu.id = ar.created_by
                  left join users_master au on au.id = ar.approved_by
                  left join users_master ru on ru.id = ar.rejected_by
                  where ${bodyStatus} ar.is_deleted = 0
                  order by ar.id desc;`;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Regularization Requests";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getByUser = async function (user_id) {
  try {
    const query = `select ar.*,
                    case
                      when ar.status = 0 then 'Pending'
                      when ar.status = 1 then 'Approved'
                      when ar.status = 2 then 'Rejected'
                      else 'Unknown'
                    end as status_name
                  from attendance_regularization ar
                  where ar.user_id = :user_id and ar.is_deleted = 0
                  order by ar.punch_date desc, ar.id desc;`;
    const data = await sequelize.query(query, { replacements: { user_id }, type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Regularization Requests";
    return responseCodes.BAD_REQUEST;
  }
};
