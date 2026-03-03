const { menuPermission } = require("../models");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require("sequelize");

exports.addData = async function (body) {
  try {
    var result = await menuPermission.create(body.data);
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
    await menuPermission.update(body.data, {
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
    await menuPermission.destroy({
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

exports.getPermissions = async function (body) {
    try {
      const menuQuery = `SELECT * FROM menu_master mm
                        LEFT JOIN menu_permission mp ON mp.menu_id = mm.id
                        WHERE ((mp.is_active = 1 OR mp.is_active IS NULL)
                        AND (mp.user_id = ${body.emp_id} OR mp.user_id IS NULL))
                        ORDER BY mm.menu_name ASC;`
        // const menuQuery = ` SELECT * FROM menu_permission  mp
        //                     LEFT JOIN menu_master AS mm ON mm.id = mp.menu_id
        //                     WHERE is_active = 1 AND user_id = ${body.emp_id}
        //                     AND designation_id = ${body.designation_id};`;

        const linkQuery = ` SELECT * FROM link_permission  WHERE is_active = 1  AND user_id = ${body.emp_id};`;

        const menuPermissions = await sequelize.query(menuQuery, { type: QueryTypes.SELECT });
        const linkPermissions = await sequelize.query(linkQuery, { type: QueryTypes.SELECT });

        const data = {
            menu_permissions: menuPermissions,
            link_permissions: linkPermissions
        };

        responseCodes.SUCCESS.data = data;
        responseCodes.SUCCESS.message = "Permissions fetched successfully.";
        return responseCodes.SUCCESS;

    } catch (e) {
        console.error(e);
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to load data.";
        return responseCodes.BAD_REQUEST;
    }
};


exports.getOneData = async function (id) {
  try {
    let query = ``;
    let data = await sequelize.query(query, { type: QueryTypes.SELECT });
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