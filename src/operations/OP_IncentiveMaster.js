const { incentiveMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

// department_ids/employee_ids arrive from the frontend as arrays (department is a
// single-select wrapped into a 1-element array; employee is a real multi-select). Every
// combination becomes its own row - an empty array on a dimension means "all" for that
// dimension, represented as a single null in the combo.
function buildScopeCombinations(data) {
  const depts = Array.isArray(data.department_ids) && data.department_ids.length ? data.department_ids : [null];
  const employees = Array.isArray(data.employee_ids) && data.employee_ids.length ? data.employee_ids : [null];

  const combos = [];
  for (const department_id of depts) {
    for (const employee_id of employees) {
      combos.push({ department_id, employee_id });
    }
  }
  return combos;
}

function baseFields(data) {
  const { department_ids, employee_ids, ...rest } = data;
  return rest;
}

// Looks up an employee's latest active monthly Basic + DA (users_salary_details,
// salary_type = 1) - same source getAllData's computed_amount reads live. employee_id is
// null for department/company-wide scopes, where a single employee's salary doesn't apply.
async function resolveBasicDa(employee_id) {
  if (!employee_id) return 0;
  const rows = await sequelize.query(
    `select usd.basic_salary + usd.dearness_allowance as basic_da
     from users_salary_details usd
     where usd.user_id = :employee_id and usd.status = 1 and usd.salary_type = 1
     order by usd.effective_from desc nulls last, usd.id desc
     limit 1`,
    { replacements: { employee_id }, type: QueryTypes.SELECT }
  );
  return rows.length ? Number(rows[0].basic_da || 0) : 0;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

// Snapshot amount stored on the row at save time: (basic + DA) * incentive_value / 100 for
// percentage type, or incentive_value itself for flat type. Downstream consumers (e.g. the
// monthly accrual cron) read this stored column rather than recomputing it themselves.
async function computeIncentiveAmount(row) {
  if (row.value_type === "percentage") {
    const basic_da = await resolveBasicDa(row.employee_id);
    return round2((basic_da * Number(row.incentive_value)) / 100);
  }
  return round2(Number(row.incentive_value));
}

exports.addData = async function (body) {
  try {
    const base = baseFields(body.data);
    const combos = buildScopeCombinations(body.data);
    const rows = await Promise.all(
      combos.map(async combo => {
        const row = { ...base, ...combo };
        row.incentive_amount = await computeIncentiveAmount(row);
        return row;
      })
    );
    const result = await incentiveMaster.bulkCreate(rows);
    responseCodes.SUCCESS.data = result.map(r => r.id);
    responseCodes.SUCCESS.message = rows.length > 1 ? `${rows.length} Rows Added Successfully` : "Row Added Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateData = async function (body) {
  try {
    const base = baseFields(body.data);
    const [firstCombo, ...restCombos] = buildScopeCombinations(body.data);

    const firstRow = { ...base, ...firstCombo };
    firstRow.incentive_amount = await computeIncentiveAmount(firstRow);

    await incentiveMaster.update(firstRow, {
      where: { id: body.id },
    });

    // Extra selections beyond the first combination didn't exist before this edit -
    // they become new rows rather than overwriting the one row being edited.
    if (restCombos.length) {
      const extraRows = await Promise.all(
        restCombos.map(async combo => {
          const row = {
            ...base,
            ...combo,
            created_by: base.modified_by,
            created_date: base.modified_date,
            modified_by: null,
            modified_date: null,
          };
          row.incentive_amount = await computeIncentiveAmount(row);
          return row;
        })
      );
      await incentiveMaster.bulkCreate(extraRows);
    }

    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = restCombos.length
      ? `Row Updated, ${restCombos.length} New Row(s) Added`
      : "Row Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  try {
    await incentiveMaster.update(body.data, {
      where: { id: body.id },
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
    // Percentage-type incentives are computed per employee off their latest monthly
    // Basic + DA (users_salary_details, salary_type = 1); flat-type just uses incentive_value.
    const query = `select im.*, dvm.field_value as incentive_type_name,
                    dm.name as department_name,
                    concat(eu.first_name, ' ', eu.last_name) as employee_name,
                    concat(um.first_name, ' ', um.last_name) as created_by_name,
                    esd.basic_da,
                    case when im.value_type = 'percentage'
                         then round(coalesce(esd.basic_da, 0) * im.incentive_value / 100, 2)
                         else im.incentive_value
                    end as computed_amount
                  from incentive_master im
                  join dropdown_value_master dvm on dvm.id = im.incentive_type_id
                  left join department_master dm on dm.id = im.department_id
                  left join users_master eu on eu.id = im.employee_id
                  join users_master um on um.id = im.created_by
                  left join lateral (
                    select usd.basic_salary + usd.dearness_allowance as basic_da
                    from users_salary_details usd
                    where usd.user_id = im.employee_id and usd.status = 1 and usd.salary_type = 1
                    order by usd.effective_from desc nulls last, usd.id desc
                    limit 1
                  ) esd on true
                  where im.status = 1
                  order by im.id desc;`;
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

exports.getOneData = async function (id) {
  try {
    const data = await incentiveMaster.findAll({ where: { id: id } });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
