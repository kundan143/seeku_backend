const { leads, leadHistory, leadTrackingLog } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

// Columns that are audit metadata, not lead content - never worth a history row.
const HISTORY_IGNORED_FIELDS = new Set(["id", "created_by", "created_date", "modified_by", "modified_date", "ip_address"]);

function serializeValue(value) {
  if (value === null || value === undefined) {
    return null;
  }
  return Array.isArray(value) ? JSON.stringify(value) : String(value);
}

function buildFieldChanges(oldRow, newData) {
  const changes = [];
  for (const field of Object.keys(newData || {})) {
    if (HISTORY_IGNORED_FIELDS.has(field)) {
      continue;
    }
    const oldValue = serializeValue(oldRow ? oldRow[field] : undefined);
    const newValue = serializeValue(newData[field]);
    if (oldValue !== newValue) {
      changes.push({ field_name: field, old_value: oldValue, new_value: newValue });
    }
  }
  return changes;
}

async function recordHistory(leadId, changeType, changes, userId, timestamp) {
  if (!changes.length) {
    return;
  }
  await leadHistory.bulkCreate(
    changes.map((change) => ({
      lead_id: leadId,
      field_name: change.field_name,
      old_value: change.old_value,
      new_value: change.new_value,
      change_type: changeType,
      created_by: userId,
      created_date: timestamp,
    }))
  );
}

exports.addData = async function (body) {
  try {
    const result = await leads.create(body.data);
    await recordHistory(result.id, "CREATED", buildFieldChanges(null, body.data), body.data.created_by, body.data.created_date);
    await leadTrackingLog.create({
      lead_id: result.id,
      stage_id: body.data.stage_id,
      status: 1,
      is_deleted: 0,
      created_by: body.data.created_by,
      created_date: body.data.created_date,
    });
    responseCodes.SUCCESS.data = result.id;
    responseCodes.SUCCESS.message = "Lead Added Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Lead";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateData = async function (body) {
  try {
    const existing = await leads.findByPk(body.id);
    const changes = buildFieldChanges(existing ? existing.get({ plain: true }) : null, body.data);
    await leads.update(body.data, {
      where: {
        id: body.id,
      },
    });
    await recordHistory(body.id, "UPDATED", changes, body.data.modified_by, body.data.modified_date);
    responseCodes.SUCCESS.data = body.id;
    responseCodes.SUCCESS.message = "Lead Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Lead";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  try {
    const existing = await leads.findByPk(body.id);
    const changes = buildFieldChanges(existing ? existing.get({ plain: true }) : null, body.data);
    await leads.update(body.data, {
      where: {
        id: body.id,
      },
    });
    await recordHistory(body.id, "UPDATED", changes, body.data.modified_by, body.data.modified_date);
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Lead Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Lead";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getAllData = async function () {
  try {
    let query = `select l.*, om.org_name as buyer_name,
                    sm.stage_name, sm.color_code as stage_color,
                    concat(au.first_name, ' ', au.last_name) as assigned_to_name
                  from leads l
                  join organizations_master om on om.id = l.org_id
                  join stage_master sm on sm.id = l.stage_id
                  left join users_master au on au.id = l.assigned_to
                  where l.is_deleted = 0
                  order by l.id desc;`;
    let results = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = results;
    responseCodes.SUCCESS.message = "Data Retrieved Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Retrieve Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getOneData = async function (id) {
  try {
    let query = `select l.*, om.org_name as buyer_name
                  from leads l
                  join organizations_master om on om.id = l.org_id
                  where l.id = :id;`;
    let results = await sequelize.query(query, { replacements: { id }, type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = results;
    responseCodes.SUCCESS.message = "Data Retrieved Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Retrieve Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getStages = async function () {
  try {
    let query = `select id, stage_name, color_code
                 from stage_master
                 where status = 1
                 order by id asc;`;
    let results = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = results;
    responseCodes.SUCCESS.message = "Data Retrieved Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Retrieve Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.moveStage = async function (body) {
  try {
    const remarks = body.data.remarks?.trim();
    if (!remarks) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "Remark is required to move the lead stage";
      return responseCodes.BAD_REQUEST;
    }
    const existing = await leads.findByPk(body.id);
    if (!existing) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "Lead Not Found";
      return responseCodes.BAD_REQUEST;
    }
    const oldStageId = existing.stage_id;
    const { remarks: _remarks, ...leadData } = body.data;
    await leads.update(leadData, { where: { id: body.id } });
    await recordHistory(
      body.id,
      "STAGE_MOVED",
      buildFieldChanges({ stage_id: oldStageId }, leadData),
      body.data.modified_by,
      body.data.modified_date
    );
    await leadTrackingLog.create({
      lead_id: body.id,
      stage_id: body.data.stage_id,
      remarks,
      status: 1,
      is_deleted: 0,
      created_by: body.data.modified_by,
      created_date: body.data.modified_date,
    });
    responseCodes.SUCCESS.data = body.id;
    responseCodes.SUCCESS.message = "Lead Stage Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Lead Stage";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getHistory = async function (id) {
  try {
    let query = `select h.*, trim(concat(u.first_name, ' ', u.last_name)) as changed_by_name
                  from lead_history h
                  join users_master u on u.id = h.created_by
                  where h.lead_id = :id
                  order by h.created_date desc, h.id desc;`;
    let results = await sequelize.query(query, { replacements: { id }, type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = results;
    responseCodes.SUCCESS.message = "Data Retrieved Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Retrieve Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getStageHistory = async function (id) {
  try {
    let query = `select ltl.id, ltl.lead_id, ltl.stage_id, ltl.remarks, ltl.created_date,
                    sm.stage_name, sm.color_code as stage_color,
                    trim(concat(u.first_name, ' ', u.last_name)) as changed_by_name
                  from lead_tracking_log ltl
                  join stage_master sm on sm.id = ltl.stage_id
                  left join users_master u on u.id = ltl.created_by
                  where ltl.lead_id = :id and ltl.is_deleted = 0
                  order by ltl.created_date desc, ltl.id desc;`;
    let results = await sequelize.query(query, { replacements: { id }, type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = results;
    responseCodes.SUCCESS.message = "Data Retrieved Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Retrieve Data";
    return responseCodes.BAD_REQUEST;
  }
};
