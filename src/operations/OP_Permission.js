const { menuPermission } = require("../models");
const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes, col } = require("sequelize");

exports.addData = async function (body) {
  try {
    const results = [];

    // Group permissions by user_id
    const grouped = body.permissions.reduce((acc, p) => {
      (acc[p.user_id] = acc[p.user_id] || []).push(p.menu_id);
      return acc;
    }, {});

    // Delete rows where menu_id is not in the incoming list for each user
    for (const [user_id, menuIds] of Object.entries(grouped)) {
      await menuPermission.destroy({
        where: {
          user_id,
          menu_id: { [Op.notIn]: menuIds },
        },
      });
    }

    // Upsert logic
    for (const permission of body.permissions) {
      const {
        user_id,
        menu_id,
        add_opt,
        edit_opt,
        view_opt,
        delete_opt,
        designation_id,
        created_by,
        modified_by,
      } = permission;

      const existing = await menuPermission.findOne({
        where: { user_id, menu_id },
      });

      if (existing) {
        const hasChanges =
          existing.add_opt !== add_opt ||
          existing.edit_opt !== edit_opt ||
          existing.view_opt !== view_opt ||
          existing.delete_opt !== delete_opt;

        if (hasChanges) {
          await existing.update({
            add_opt,
            edit_opt,
            view_opt,
            delete_opt,
            modified_by,
            modified_date: new Date(),
          });
          results.push({ ...existing.toJSON(), action: "updated" });
        } else {
          results.push({ ...existing.toJSON(), action: "unchanged" });
        }
      } else {
        const created = await menuPermission.create({
          user_id,
          menu_id,
          add_opt,
          edit_opt,
          view_opt,
          delete_opt,
          designation_id,
          created_by,
          created_date: new Date(),
          modified_by: null,
          modified_date: null,
          is_active: 1,
        });
        results.push({ ...created.toJSON(), action: "created" });
      }
    }

    // Summary
    const summary = results.reduce(
      (acc, r) => {
        acc[r.action] = (acc[r.action] || 0) + 1;
        return acc;
      },
      { created: 0, updated: 0, unchanged: 0 }
    );

    responseCodes.SUCCESS.data = results;
    responseCodes.SUCCESS.message = `Permissions processed — Created: ${summary.created}, Updated: ${summary.updated}, Unchanged: ${summary.unchanged}`;
    return responseCodes.SUCCESS;

  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to process permissions";
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
      const menuQuery = `SELECT  mm.id, mm.parent_id, mm.menu_name,
                        mm.child_rank,mp.user_id,mp.add_opt,mp.edit_opt, mp.delete_opt, 
                        mp.view_opt, mp.designation_id, mp.is_active, mm.id as menu_id
                        FROM menu_master mm
                        LEFT JOIN menu_permission mp ON mp.menu_id = mm.id
                        WHERE (mp.user_id = ${body.emp_id} OR mp.user_id IS NULL)
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