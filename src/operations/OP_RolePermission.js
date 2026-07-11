const { rolePermission, menuPermission } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { Op, QueryTypes } = require("sequelize");

// Seeds a user's menu_permission rows from their role's template. Used
// when a user is first created with a role, when a role is (re)assigned via
// Employee Master's "Assign Role" action, and by the bulk "sync users"
// action below — in every case the user's existing menu_permission rows are
// replaced with a fresh copy of the role's current defaults, which they can
// still hand-tune afterward from the Permission screen. Runs inside the
// caller's transaction.
async function copyRoleTemplateToUser({ roleId, userId, createdBy }, transaction) {
  const templateRows = await sequelize.query(
    `SELECT menu_id, add_opt, edit_opt, view_opt, delete_opt, excel_opt, pdf_opt, approve_opt, mailsent_opt
     FROM role_permission WHERE role_id = :roleId`,
    { type: QueryTypes.SELECT, replacements: { roleId }, transaction }
  );

  await menuPermission.destroy({ where: { user_id: userId }, transaction });

  if (!templateRows.length) return;

  await menuPermission.bulkCreate(
    templateRows.map((r) => ({
      user_id: userId,
      role_id: roleId,
      menu_id: r.menu_id,
      add_opt: r.add_opt,
      edit_opt: r.edit_opt,
      view_opt: r.view_opt,
      delete_opt: r.delete_opt,
      excel_opt: r.excel_opt,
      pdf_opt: r.pdf_opt,
      approve_opt: r.approve_opt,
      mailsent_opt: r.mailsent_opt,
      created_by: createdBy,
      created_date: new Date(),
      is_active: 1,
    })),
    { transaction }
  );
}
exports.copyRoleTemplateToUser = copyRoleTemplateToUser;

// Resyncs every active user currently on a role to that role's current
// template. Shared by addData (auto-cascade right after a role's defaults
// change) and syncUsersToRole (manual retrigger, e.g. after a user is
// hand-tuned and an admin wants to reset them back to defaults).
async function syncActiveUsersForRole({ roleId, modifiedBy }, transaction) {
  const users = await sequelize.query(
    `SELECT id FROM users_master WHERE role_id = :roleId AND status = true`,
    { type: QueryTypes.SELECT, replacements: { roleId }, transaction }
  );

  for (const u of users) {
    await copyRoleTemplateToUser(
      { roleId, userId: u.id, createdBy: modifiedBy },
      transaction
    );
  }

  return users.length;
}

exports.addData = async function (body) {
  const t = await sequelize.transaction();
  try {
    const results = [];

    // Group permissions by role_id
    const grouped = body.permissions.reduce((acc, p) => {
      (acc[p.role_id] = acc[p.role_id] || []).push(p.menu_id);
      return acc;
    }, {});

    // Delete rows where menu_id is not in the incoming list for each role
    for (const [role_id, menuIds] of Object.entries(grouped)) {
      await rolePermission.destroy({
        where: {
          role_id,
          menu_id: { [Op.notIn]: menuIds },
        },
        transaction: t,
      });
    }

    // Upsert logic
    for (const permission of body.permissions) {
      const {
        role_id,
        menu_id,
        add_opt,
        edit_opt,
        view_opt,
        delete_opt,
        excel_opt,
        pdf_opt,
        approve_opt,
        mailsent_opt,
        created_by,
        modified_by,
      } = permission;

      const existing = await rolePermission.findOne({
        where: { role_id, menu_id },
        transaction: t,
      });

      if (existing) {
        const hasChanges =
          existing.add_opt !== add_opt ||
          existing.edit_opt !== edit_opt ||
          existing.view_opt !== view_opt ||
          existing.delete_opt !== delete_opt ||
          existing.excel_opt !== excel_opt ||
          existing.pdf_opt !== pdf_opt ||
          existing.approve_opt !== approve_opt ||
          existing.mailsent_opt !== mailsent_opt;

        if (hasChanges) {
          await existing.update(
            {
              add_opt,
              edit_opt,
              view_opt,
              delete_opt,
              excel_opt,
              pdf_opt,
              approve_opt,
              mailsent_opt,
              modified_by,
              modified_date: new Date(),
            },
            { transaction: t }
          );
          results.push({ ...existing.toJSON(), action: "updated" });
        } else {
          results.push({ ...existing.toJSON(), action: "unchanged" });
        }
      } else {
        const created = await rolePermission.create(
          {
            role_id,
            menu_id,
            add_opt,
            edit_opt,
            view_opt,
            delete_opt,
            excel_opt,
            pdf_opt,
            approve_opt,
            mailsent_opt,
            created_by,
            created_date: new Date(),
            modified_by: null,
            modified_date: null,
            is_active: 1,
          },
          { transaction: t }
        );
        results.push({ ...created.toJSON(), action: "created" });
      }
    }

    // Cascade: push this role's now-current template onto every active user
    // already assigned to it, so their menu_permission stays in lockstep
    // with role_permission instead of drifting until someone clicks "Sync".
    let syncedUsers = 0;
    for (const role_id of Object.keys(grouped)) {
      const permissionForRole = body.permissions.find((p) => String(p.role_id) === role_id);
      const modifiedBy = permissionForRole?.modified_by ?? permissionForRole?.created_by;
      syncedUsers += await syncActiveUsersForRole(
        { roleId: role_id, modifiedBy },
        t
      );
    }

    await t.commit();

    // Summary
    const summary = results.reduce(
      (acc, r) => {
        acc[r.action] = (acc[r.action] || 0) + 1;
        return acc;
      },
      { created: 0, updated: 0, unchanged: 0 }
    );

    responseCodes.SUCCESS.data = results;
    responseCodes.SUCCESS.message = `Role permissions processed — Created: ${summary.created}, Updated: ${summary.updated}, Unchanged: ${summary.unchanged}. Synced ${syncedUsers} user(s) already on this role.`;
    return responseCodes.SUCCESS;

  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to process role permissions";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getPermissions = async function (body) {
  try {
    // LEFT JOIN's role filter lives in the ON clause (not WHERE) so every
    // menu always appears exactly once for this role — even menus that
    // already have a template row for a *different* role — instead of
    // disappearing when this role has no row for them yet.
    const menuQuery = `SELECT mm.id, mm.parent_id, mm.menu_name, mm.icon,
                      mm.child_rank, rp.role_id, rp.add_opt, rp.edit_opt, rp.delete_opt,
                      rp.view_opt, rp.excel_opt, rp.pdf_opt, rp.approve_opt, rp.mailsent_opt,
                      rp.is_active, mm.id as menu_id
                      FROM menu_master mm
                      LEFT JOIN role_permission rp ON rp.menu_id = mm.id AND rp.role_id = :role_id
                      ORDER BY mm.menu_name ASC;`;

    const menuPermissions = await sequelize.query(menuQuery, {
      type: QueryTypes.SELECT,
      replacements: { role_id: body.role_id },
    });

    responseCodes.SUCCESS.data = { menu_permissions: menuPermissions };
    responseCodes.SUCCESS.message = "Role permissions fetched successfully.";
    return responseCodes.SUCCESS;

  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to load data.";
    return responseCodes.BAD_REQUEST;
  }
};

// Manual retrigger for syncActiveUsersForRole — addData already cascades
// automatically whenever a role's permissions are saved, so this is only
// needed to reset users who were individually hand-tuned back to defaults
// without re-saving the role itself.
exports.syncUsersToRole = async function (body) {
  let t;
  try {
    if (!body.role_id) {
      throw new TypeError("Missing required field: role_id");
    }

    t = await sequelize.transaction();

    const synced = await syncActiveUsersForRole(
      { roleId: body.role_id, modifiedBy: body.modified_by },
      t
    );

    await t.commit();

    responseCodes.SUCCESS.data = { synced };
    responseCodes.SUCCESS.message = `Synced ${synced} user(s) to this role's defaults.`;
    return responseCodes.SUCCESS;
  } catch (e) {
    if (t) await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to sync users to role defaults";
    return responseCodes.BAD_REQUEST;
  }
};
