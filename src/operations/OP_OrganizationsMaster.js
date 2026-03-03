const {
  organizationsMaster,
  relOrgCategories,
  relOrgPolymer,
  orgAddresses,
  countryMaster,
  stateMaster,
  cityMaster,
  orgContactEmail,
  orgContactNumbers,
  relOrgGradeMaster,
  orgContactPerson,
  usersMaster,
  relSubCategoryMaster,
} = require("../models");
// const { addActivityLog } = require("../services/activityLog");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require("sequelize");

exports.addData = async function (body) {
  try {
    var result = await organizationsMaster.create(body.data);
    if (body.org_cat_ids.length > 0) {
      body.org_cat_ids.forEach((element) => {
        element.org_id = result.id;
      });
      await relOrgCategories.bulkCreate(body.org_cat_ids);
    }

    // sendNotification('new_org_add', result.id, body.data.created_by);
    responseCodes.SUCCESS.data = result.id;
    // addActivityLog(organizationsMaster.tableName, result.id, body, "ADD");
    responseCodes.SUCCESS.message = "Row Added Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e);
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Add Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateData = async function (body) {
  try {
    await organizationsMaster.update(body.data, {
      where: {
        id: body.id,
      },
    });
    await relOrgCategories.destroy({
      where: {
        org_id: body.id,
      },
    });
    if (body.org_cat_ids.length > 0) {
      await relOrgCategories.bulkCreate(body.org_cat_ids);
    }
    responseCodes.SUCCESS.data = null;
    // addActivityLog(organizationsMaster.tableName, body.id, body, "UPDATE");
    responseCodes.SUCCESS.message = "Row Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e, "ERROR");
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.deleteData = async function (body) {
  try {
    await organizationsMaster.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    // addActivityLog(organizationsMaster.tableName, body.id, body, "DELETE");
    responseCodes.SUCCESS.message = "Row Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log("aaaaa", e);
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getAllData = async function () {
  try {
    var data = await organizationsMaster.findAll({
      where: {
        status: true,
      },
      order: [["id", "ASC"]],
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
    if (id) {
      let query = `select * 
		from organizations_master om 
		left JOIN (
			SELECT org_id , ARRAY_AGG(name) AS polymer 
			FROM rel_org_polymer as rop
			join polymer_master as pm on pm.id = rop.polymer_id 
			GROUP BY 1 
		) as rop on rop.org_id = om.id
		where om.id = ${id}`;
      let data = await sequelize.query(query, {
        type: QueryTypes.SELECT,
      });
      responseCodes.SUCCESS.data = data;
      responseCodes.SUCCESS.message = "";
      return responseCodes.SUCCESS;
    } else {
      responseCodes.BAD_REQUEST.data = e;
      responseCodes.BAD_REQUEST.message = "Failed to Load Data";
      return responseCodes.BAD_REQUEST;
    }
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
exports.searchOrganizations = async function (body) {
  try {
    let query = `SELECT * FROM organizations_master WHERE status = TRUE AND org_name ILIKE '%${body}%'`;
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

// exports.getOneData = async function (id) {
// 	try {
// 		var data = await organizationsMaster.findAll({
// 			where: {
// 				id: id
// 			}
// 		});
// 		responseCodes.SUCCESS.data = data;
// 		responseCodes.SUCCESS.message = "";
// 		return responseCodes.SUCCESS;
// 	} catch (e) {
// 		responseCodes.BAD_REQUEST.data = e;
// 		responseCodes.BAD_REQUEST.message = "Failed to Load Data";
// 		return responseCodes.BAD_REQUEST;
// 	}
// };

exports.getCategoryWiseOrg = async function (body) {
  try {
    var data = await organizationsMaster.findAll({
      where: {
        status: true,
      },
      attributes: ["id", "org_name", "is_indent"],
      include: [
        {
          model: relOrgCategories,
          where: {
            org_cat_id: body.org_cat_id,
          },
        },
      ],
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

exports.getCategoryWiseOrgAllDetailsForIndent = async function (body) {
  try {
    var data = await organizationsMaster.findAll({
      where: {
        is_indent_blocked: 0,
      },
      include: [
        {
          model: orgAddresses,
          include: [
            {
              model: countryMaster,
              required: false,
            },
            {
              model: stateMaster,
              required: false,
            },
            {
              model: cityMaster,
              required: false,
            },
          ],
        },
        {
          model: usersMaster,
          required: false,
        },
        {
          model: orgContactEmail,
          required: false,
        },
        {
          model: orgContactNumbers,
          required: false,
        },
        {
          model: relOrgCategories,
          where: {
            org_cat_id: body.org_cat_id,
          },
        },
      ],
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e, "ERROR");
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
exports.getCategoryWiseOrgAllDetails = async function (body) {
  try {
    var data = await organizationsMaster.findAll({
      where: {
        status: true,
      },
      include: [
        {
          model: orgAddresses,
          include: [
            {
              model: countryMaster,
              required: false,
            },
            {
              model: stateMaster,
              required: false,
            },
            {
              model: cityMaster,
              required: false,
            },
          ],
        },
        {
          model: usersMaster,
          required: false,
        },
        {
          model: orgContactEmail,
          required: false,
        },
        {
          model: orgContactNumbers,
          required: false,
        },
        {
          model: relOrgCategories,
          where: {
            org_cat_id: body.org_cat_id,
          },
        },
      ],
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e, "ERROR");
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getStatusWiseOrgList = async function (body) {
  try {
    let zoneWise = ``;
    if (body.user_id != null && body.user_id != undefined) {
      zoneWise = ` AND om.sales_zone_id = ` + body.user_id;
    }

    let query =
      `SELECT
					om.*, org_categories.category_type,org_categories_qty.maximum_quantity,
					CONCAT(um.first_name, ' ', um.last_name) AS zone,
					org_country.country AS country, org_country.state AS state, org_country.city AS city,
					(select oa.address from org_addresses oa where oa.address_type='1' and oa.org_id=om.id limit 1) as head_office_address
					FROM organizations_master om
					LEFT JOIN users_master um ON um.id = om.sales_zone_id
					LEFT JOIN (
						SELECT
							roc.org_id,
							STRING_AGG(ocm.category_type, ', ') AS category_type
						FROM org_categories_master AS ocm
						JOIN rel_org_categories roc ON roc.org_cat_id = ocm.id
						GROUP BY roc.org_id
					) AS org_categories ON org_categories.org_id = om.id
					LEFT JOIN (
						SELECT org_id,
							STRING_AGG( CAST(maximum_quantity AS VARCHAR), ', ') as maximum_quantity
						FROM rel_org_categories
						GROUP BY org_id
					) AS org_categories_qty ON org_categories_qty.org_id = om.id
					LEFT JOIN (
						SELECT
							oa.org_id,
							STRING_AGG(cm.name, ', ') AS country,
							STRING_AGG(sm.name, ', ') AS state,
							STRING_AGG(city.name, ', ') AS city
						FROM org_addresses AS oa
						LEFT JOIN country_master AS cm ON cm.id = oa.country_id
						LEFT JOIN state_master AS sm ON sm.id = oa.state_id
						LEFT JOIN city_master AS city ON city.id = oa.city_id
						GROUP BY oa.org_id
					) AS org_country ON org_country.org_id = om.id
					WHERE om.status = ` +
      body.status +
      ` ${zoneWise}
					ORDER BY om.id DESC`;

    let data = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e);
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateOrgStatus = async function (body) {
  try {
    await organizationsMaster.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    // addActivityLog(organizationsMaster.tableName, body.id, body, "UPDATE");
    responseCodes.SUCCESS.message = "Row Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e, "ERROR");
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Row";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getZoneWiseBuyers = async function (body) {
  try {
    var data = await organizationsMaster.findAll({
      include: [
        {
          model: orgAddresses,
          include: [
            {
              model: countryMaster,
              required: false,
            },
            {
              model: stateMaster,
              required: false,
            },
            {
              model: cityMaster,
              required: false,
            },
          ],
        },
        {
          model: orgContactEmail,
          required: false,
        },
        {
          model: orgContactNumbers,
          required: false,
        },
        {
          model: relOrgCategories,
          where: {
            org_cat_id: 1,
          },
        },
      ],
      where: {
        [Op.or]: [{ sales_zone_id: body.zone_id }, { sales_zone_id: null }],
      },
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e, "ERROR");
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.updateIndentStatus = async function (body) {
  try {
    await organizationsMaster.update(body.data, {
      where: {
        id: body.id,
      },
    });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Row Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e, "ERROR");
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Row";
    return responseCodes.BAD_REQUEST;
  }
};
