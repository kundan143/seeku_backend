const { assetMaster, dropdownValueMaster, organizationsMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require("sequelize");

async function generateAssetCode() {
  const rows = await sequelize.query("select nextval('asset_code_seq') as seq", { type: QueryTypes.SELECT });
  return 'AST-' + String(rows[0].seq).padStart(6, '0');
}

exports.addData = async function (body) {
  try {
    body.data.asset_code = await generateAssetCode();
    var result = await assetMaster.create(body.data);
    responseCodes.SUCCESS.data = result.id;
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
    delete body.data.asset_code;
    await assetMaster.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
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
    await assetMaster.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Row Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getAllData = async function () {
  try {
    var query = `select am.*, an.field_value as asset_name, cat.field_value as category_name,
                    bm.field_value as brand_model_name, om.org_name as supplier_name
                  from asset_master am
                  left join dropdown_value_master an on an.id = am.asset_name_id
                  left join dropdown_value_master cat on cat.id = am.category_id
                  left join dropdown_value_master bm on bm.id = am.brand_model_id
                  left join organizations_master om on om.id = am.supplier_id
                  where am.is_deleted = 0
                  order by am.id asc;`;
    var data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};

async function resolveDropdownId(field_id, text, created_by, created_date, cache) {
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

async function resolveSupplierId(text, created_by, created_date, cache) {
  const trimmed = String(text || '').trim();
  if (!trimmed) {
    return null;
  }
  const cacheKey = trimmed.toLowerCase();
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }
  let org = await organizationsMaster.findOne({
    where: { org_name: { [Op.iLike]: trimmed } },
  });
  if (!org) {
    org = await organizationsMaster.create({
      org_name: trimmed,
      status: true,
      created_by,
      created_date,
    });
  }
  cache[cacheKey] = org.id;
  return org.id;
}

exports.bulkCreate = async function (body) {
  try {
    const rows = Array.isArray(body.data) ? body.data : [];
    const assetNameFieldId = body.asset_name_field_id;
    const categoryFieldId = body.category_field_id;
    const brandModelFieldId = body.brand_model_field_id;
    const created_by = body.created_by;
    const created_date = body.created_date;

    if (!rows.length) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "No rows to import.";
      return responseCodes.BAD_REQUEST;
    }
    if (!assetNameFieldId || !categoryFieldId) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "Asset Name / Category dropdown fields are not configured yet.";
      return responseCodes.BAD_REQUEST;
    }

    const dropdownCache = {};
    const supplierCache = {};
    let successCount = 0;
    const failures = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (!row.asset_name || !row.category) {
          throw new Error("Asset Name and Category are required.");
        }
        const asset_name_id = await resolveDropdownId(assetNameFieldId, row.asset_name, created_by, created_date, dropdownCache);
        const category_id = await resolveDropdownId(categoryFieldId, row.category, created_by, created_date, dropdownCache);
        const brand_model_id = brandModelFieldId
          ? await resolveDropdownId(brandModelFieldId, row.brand_model, created_by, created_date, dropdownCache)
          : null;
        const supplier_id = await resolveSupplierId(row.supplier_name, created_by, created_date, supplierCache);
        await assetMaster.create({
          asset_name_id,
          asset_code: await generateAssetCode(),
          category_id,
          serial_number: row.serial_number || null,
          brand_model_id,
          specifications: row.specifications || null,
          location: row.location || null,
          asset_condition: row.asset_condition || 1,
          invoice_number: row.invoice_number || null,
          remarks: row.remarks || null,
          purchase_date: row.purchase_date || null,
          purchase_value: row.purchase_value || null,
          supplier_id,
          warranty_expiry_date: row.warranty_expiry_date || null,
          status: 1,
          created_by,
          created_date,
        });
        successCount++;
      } catch (e) {
        failures.push({
          row: i + 2,
          asset_name: row.asset_name || '',
          error: e?.parent?.code === '23505' ? 'Duplicate asset code or serial number.' : (e.message || 'Failed to import row.'),
        });
      }
    }

    responseCodes.SUCCESS.data = { successCount, failedCount: failures.length, failures };
    responseCodes.SUCCESS.message = `Imported ${successCount} of ${rows.length} assets.`;
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Bulk Import Assets";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getOneData = async function (id) {
  try {
    var data = await assetMaster.findOne({
      where: {
        id: id,
        is_deleted: 0,
      },
    });
    if (data) {
      responseCodes.SUCCESS.data = data;
      responseCodes.SUCCESS.message = "";
      return responseCodes.SUCCESS;
    } else {
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "No Record Found";
      return responseCodes.NOT_FOUND;
    }
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
