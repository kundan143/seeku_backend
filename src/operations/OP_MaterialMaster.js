const { materialMaster, materialMasterHistory, cableStageMaster, unitTypeMaster, dropdownValueMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require("sequelize");
// const { addActivityLog } = require("../services/activityLog");

// Columns that are audit metadata, not material content - never worth a history row.
const HISTORY_IGNORED_FIELDS = new Set(["id", "created_by", "created_date", "modified_by", "modified_date"]);

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

// FK columns whose history should show the referenced name, not the raw id.
const FK_NAME_RESOLVERS = {
  cable_stage_id: async (id) => {
    const row = await cableStageMaster.findByPk(id);
    return row ? row.stage_name : `#${id}`;
  },
  uom_id: async (id) => {
    const row = await unitTypeMaster.findByPk(id);
    return row ? `${row.uom_name} (${row.uom_code})` : `#${id}`;
  },
  material_category_id: async (id) => {
    const row = await dropdownValueMaster.findByPk(id);
    return row ? row.field_value : `#${id}`;
  },
};

async function resolveHistoryDisplayValue(field_name, rawValue) {
  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return null;
  }
  const resolver = FK_NAME_RESOLVERS[field_name];
  if (!resolver) {
    return rawValue;
  }
  const id = Number(rawValue);
  if (isNaN(id)) {
    return rawValue;
  }
  try {
    return await resolver(id);
  } catch {
    return rawValue;
  }
}

async function recordHistory(materialId, changeType, changes, userId, timestamp) {
  if (!changes.length) {
    return;
  }
  const resolvedChanges = await Promise.all(changes.map(async (change) => ({
    field_name: change.field_name,
    old_value: await resolveHistoryDisplayValue(change.field_name, change.old_value),
    new_value: await resolveHistoryDisplayValue(change.field_name, change.new_value),
  })));
  await materialMasterHistory.bulkCreate(
    resolvedChanges.map((change) => ({
      material_id: materialId,
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
    var result = await materialMaster.create(body.data);
    await recordHistory(result.id, "CREATED", buildFieldChanges(null, body.data), body.data.created_by, body.data.created_date);
    responseCodes.SUCCESS.data = result.id;
    // addActivityLog(materialMaster.tableName, result.id, body, "ADD")
    responseCodes.SUCCESS.message = "Row Added Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateData = async function (body) {
  try {
    const existing = await materialMaster.findByPk(body.id);
    const changes = buildFieldChanges(existing ? existing.get({ plain: true }) : null, body.data);
    await materialMaster.update(body.data, {
      where: {
        id: body.id,
      },
    });
    await recordHistory(body.id, "UPDATED", changes, body.data.modified_by, body.data.modified_date);
    responseCodes.SUCCESS.data = null;
    // addActivityLog(materialMaster.tableName, result.id, body, "UPDATE")
    responseCodes.SUCCESS.message = "Row Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  try {
    await materialMaster.destroy({
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    // addActivityLog(materialMaster.tableName, result.id, body, "DELETE")
    responseCodes.SUCCESS.message = "Row Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Row";
    return responseCodes.BAD_REQUEST;
  }
};

async function resolveCableStageId(text, cache) {
  const trimmed = String(text || '').trim();
  if (!trimmed) {
    return null;
  }
  const cacheKey = trimmed.toLowerCase();
  if (cache[cacheKey] !== undefined) {
    return cache[cacheKey];
  }
  const record = await cableStageMaster.findOne({
    where: { stage_name: { [Op.iLike]: trimmed } },
  });
  cache[cacheKey] = record ? record.id : null;
  return cache[cacheKey];
}

async function resolveUomId(text, cache) {
  const trimmed = String(text || '').trim();
  if (!trimmed) {
    return null;
  }
  const cacheKey = trimmed.toLowerCase();
  if (cache[cacheKey] !== undefined) {
    return cache[cacheKey];
  }
  const record = await unitTypeMaster.findOne({
    where: {
      [Op.or]: [
        { uom_code: { [Op.iLike]: trimmed } },
        { uom_name: { [Op.iLike]: trimmed } },
      ],
    },
  });
  cache[cacheKey] = record ? record.id : null;
  return cache[cacheKey];
}

async function resolveMaterialCategoryId(field_id, text, created_by, created_date, cache) {
  const trimmed = String(text || '').trim();
  if (!trimmed) {
    return null;
  }
  const cacheKey = `${field_id}:${trimmed.toLowerCase()}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }
  let record = await dropdownValueMaster.findOne({
    where: { field_id, is_deleted: 0, field_value: { [Op.iLike]: trimmed } },
  });
  if (!record) {
    record = await dropdownValueMaster.create({
      field_id,
      field_value: trimmed,
      status: 1,
      is_deleted: 0,
      created_by,
      created_date,
    });
  }
  cache[cacheKey] = record.id;
  return record.id;
}

exports.bulkCreate = async function (body) {
  try {
    const rows = Array.isArray(body.data) ? body.data : [];
    const categoryFieldId = body.material_category_field_id;
    const created_by = body.created_by;
    const created_date = body.created_date;

    if (!rows.length) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "No rows to import.";
      return responseCodes.BAD_REQUEST;
    }
    if (!categoryFieldId) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "Material Category dropdown field is not configured yet.";
      return responseCodes.BAD_REQUEST;
    }

    const cableStageCache = {};
    const uomCache = {};
    const categoryCache = {};
    let successCount = 0;
    const failures = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (!row.material_name || !row.cable_stage || !row.uom || !row.material_category) {
          throw new Error("Material Name, Cable Stage, Unit Type and Material Category are required.");
        }
        if (row.rate == null || isNaN(Number(row.rate)) || Number(row.rate) <= 0) {
          throw new Error("Rate must be a positive number.");
        }
        const cable_stage_id = await resolveCableStageId(row.cable_stage, cableStageCache);
        if (!cable_stage_id) {
          throw new Error(`Cable Stage "${row.cable_stage}" not found.`);
        }
        const uom_id = await resolveUomId(row.uom, uomCache);
        if (!uom_id) {
          throw new Error(`Unit Type "${row.uom}" not found.`);
        }
        const material_category_id = await resolveMaterialCategoryId(categoryFieldId, row.material_category, created_by, created_date, categoryCache);

        const data = {
          material_name: row.material_name,
          cable_stage_id,
          uom_id,
          material_category_id,
          rate: Number(row.rate),
          density: (row.density != null && row.density !== '') ? Number(row.density) : null,
          description: row.description || null,
          created_by,
          created_date,
        };
        const result = await materialMaster.create(data);
        await recordHistory(result.id, "CREATED", buildFieldChanges(null, data), created_by, created_date);
        successCount++;
      } catch (e) {
        failures.push({
          row: i + 2,
          material_name: row.material_name || '',
          error: e.message || 'Failed to import row.',
        });
      }
    }

    responseCodes.SUCCESS.data = { successCount, failedCount: failures.length, failures };
    responseCodes.SUCCESS.message = `Imported ${successCount} of ${rows.length} materials.`;
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Bulk Import Materials";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getAllData = async function () {
  try {
    let query = ` select mm.id, mm.material_name, csm.stage_name as cable_stage_name, utm.uom_name,
                        csm.id as cable_stage_id, mm.description, mm.rate, mm.density, mm.uom_id,
                        mm.material_category_id, dvm.field_value as material_category_name,
                        concat(um.first_name, ' ', um.last_name ) as created_by, mm.created_date
                        from material_master mm
                        join cable_stage_master csm on csm.id = mm.cable_stage_id
                        join unit_type_master utm on utm.id = mm.uom_id
                        join users_master um on um.id = mm.created_by
                        left join dropdown_value_master dvm on dvm.id = mm.material_category_id
                        where mm.status = 0
                        order by mm.id desc;`;
    let data = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getOneData = async function (id) {
  try {
    let query = ` select mm.id, mm.material_name, csm.stage_name as cable_stage_name, concat(utm.uom_name, ' (', utm.uom_code,')') as uom_name_with_code,
                        csm.id as cable_stage_id, mm.description, mm.uom_id, mm.rate, mm.density,
                        mm.material_category_id, dvm.field_value as material_category_name,
                        concat(um.first_name, ' ', um.last_name ) as created_by, mm.created_date
                        from material_master mm
                        join cable_stage_master csm on csm.id = mm.cable_stage_id
                        join unit_type_master utm on utm.id = mm.uom_id
                        join users_master um on um.id = mm.created_by
                        left join dropdown_value_master dvm on dvm.id = mm.material_category_id
                        where mm.status = 0 and mm.id = ${id}
                        order by mm.id desc;`;
    let data = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
exports.getHistory = async function (id) {
  try {
    let query = `select h.*, trim(concat(u.first_name, ' ', u.last_name)) as changed_by_name
                  from material_master_history h
                  join users_master u on u.id = h.created_by
                  where h.material_id = :id
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

exports.getMaterialByCableStage = async function (cable_stage_id) {
  try {
    let query = ` select mm.id, mm.material_name, csm.stage_name as cable_stage_name, concat(utm.uom_name, ' (', utm.uom_code,')') as uom_name_with_code,
                        csm.id as cable_stage_id, mm.description, mm.uom_id, mm.rate, mm.density,
                        mm.material_category_id, dvm.field_value as material_category_name,
                        concat(um.first_name, ' ', um.last_name ) as created_by, mm.created_date
                        from material_master mm
                        join cable_stage_master csm on csm.id = mm.cable_stage_id
                        join unit_type_master utm on utm.id = mm.uom_id
                        join users_master um on um.id = mm.created_by
                        left join dropdown_value_master dvm on dvm.id = mm.material_category_id
                        where mm.status = 0 and mm.cable_stage_id = ${cable_stage_id}
                        order by mm.id desc;`;
    let data = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
