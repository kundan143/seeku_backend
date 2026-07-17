const { attendancePolicy } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

exports.addData = async function (body) {
  try {
    const result = await attendancePolicy.create(body.data);
    responseCodes.SUCCESS.data = result.id;
    responseCodes.SUCCESS.message = "Attendance Policy Saved Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Save Attendance Policy";
    return responseCodes.BAD_REQUEST;
  }
};

// Only a policy version that hasn't taken effect yet may be edited in place.
// A policy already in effect (or in the past) must be superseded by a new version instead,
// so historical attendance is never reinterpreted by a later edit.
exports.updateData = async function (body) {
  try {
    const existing = await attendancePolicy.findByPk(body.id);
    if (!existing) {
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Policy Not Found";
      return responseCodes.NOT_FOUND;
    }
    const today = new Date().toISOString().slice(0, 10);
    if (existing.effective_from <= today) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "This policy is already in effect and cannot be edited - add a new policy version instead.";
      return responseCodes.BAD_REQUEST;
    }
    await attendancePolicy.update(body.data, { where: { id: body.id } });
    responseCodes.SUCCESS.data = body.id;
    responseCodes.SUCCESS.message = "Attendance Policy Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Attendance Policy";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  try {
    const existing = await attendancePolicy.findByPk(body.id);
    if (!existing) {
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Policy Not Found";
      return responseCodes.NOT_FOUND;
    }
    const today = new Date().toISOString().slice(0, 10);
    if (existing.effective_from <= today) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "This policy is already in effect and cannot be deleted - add a new policy version instead.";
      return responseCodes.BAD_REQUEST;
    }
    await attendancePolicy.update(body.data, { where: { id: body.id } });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Attendance Policy Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Attendance Policy";
    return responseCodes.BAD_REQUEST;
  }
};

// Every policy version, most recent first, flagged with whether it's the one currently in effect.
exports.getAllData = async function () {
  try {
    const query = `select ap.*, concat(cu.first_name, ' ', cu.last_name) as created_by_name,
                    (ap.effective_from = (
                      select max(effective_from) from attendance_policy
                      where is_deleted = 0 and effective_from <= current_date
                    )) as is_currently_active
                  from attendance_policy ap
                  left join users_master cu on cu.id = ap.created_by
                  where ap.is_deleted = 0
                  order by ap.effective_from desc, ap.id desc;`;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Attendance Policies";
    return responseCodes.BAD_REQUEST;
  }
};

// The single policy version currently in effect (latest effective_from <= today).
exports.getCurrent = async function () {
  try {
    const query = `select * from attendance_policy
                    where is_deleted = 0 and effective_from <= current_date
                    order by effective_from desc, id desc
                    limit 1;`;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    if (data.length) {
      responseCodes.SUCCESS.data = data[0];
      responseCodes.SUCCESS.message = "";
      return responseCodes.SUCCESS;
    }
    responseCodes.NOT_FOUND.data = null;
    responseCodes.NOT_FOUND.message = "No Attendance Policy Configured Yet";
    return responseCodes.NOT_FOUND;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Attendance Policy";
    return responseCodes.BAD_REQUEST;
  }
};
