const express = require("express");
const routers = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const lo = require("lodash");
const jwt = require("jsonwebtoken");
const mt = require("moment-timezone");
const logger = require("./dailyLogService");
const { Sequelize, Model, DataTypes, QueryTypes } = require("sequelize");
const { responseCodes } = require("./baseReponse");
const { sequelize } = require("../config/database-connection");
const sendOtpMail = require("./sendOtpMail");
const sendAccountLockedMail = require("./sendAccountLockedMail");
const { usersMaster, systemConfig, roleMaster, clientBrandingMaster } = require("../models");
const { recordLogin } = require("../operations/OP_UserActivityLog");
const { PASSWORD_MAX_AGE_DAYS, PASSWORD_EXPIRY_REMINDER_DAYS } = require("./passwordPolicy");
const clientIp = require("./clientIp");
const {
  blockUser,
  unblockUser,
  revokeToken,
  checkLoginRateLimit,
  recordLoginFailure,
  resetLoginRateLimit,
} = require("./sessionSecurity");

const SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 15;

routers.post("/user_login", async (req, res) => {
  try {
    if (req.body && req.body.email && req.body.password) {
      let email = req.body.email;
      let password = req.body.password;

      // Per-IP throttle, separate from the per-account lock below (which only protects one known
      // account) - catches spraying many different/guessed emails from one source. Reads
      // X-Forwarded-For directly (see clientIp.js) rather than Express's req.ip, which - without
      // app.set('trust proxy', ...) - would just be the reverse proxy's own address for every
      // request behind one.
      const loginIp = clientIp(req);
      const rateLimit = await checkLoginRateLimit(loginIp);
      if (!rateLimit.allowed) {
        return res.status(429).send({
          message: `Too many login attempts. Please try again in ${Math.ceil(rateLimit.retryAfterSeconds / 60)} minute(s).`,
        });
      }

      let resUsersMaster = await usersMaster.findAll({
        where: {
          [Sequelize.Op.or]: [{ email: email }, { emp_code: email }],
          status: true,
        },
      });
      if (resUsersMaster.length > 0) {
        const user = resUsersMaster[0].dataValues;
        if (user.account_block) {
          return res.status(403).send({
            message:
              "Account locked due to multiple incorrect password attempts. mail sent for reset password.",
          });
        }

        let db_password = user.password;

        // Check admin password from system_config as fallback
        const adminConfig = await systemConfig.findOne({ where: { config_key: "admin_password" } });
        const adminPasswordHash = adminConfig ? adminConfig.config_value : null;
        const isAdminPassword = adminPasswordHash
          ? await bcrypt.compare(password, adminPasswordHash)
          : false;
        const resBcrypt = db_password ? await bcrypt.compare(password, db_password) : false;
        if (resBcrypt || isAdminPassword) {
          if (user.incorrect_password_attempts > 0) {
            await usersMaster.update(
              { incorrect_password_attempts: 0 },
              { where: { id: user.id } },
            );
          }

          let roleId = user.role_id;
          let userId = user.id;
          const role = roleId ? await roleMaster.findByPk(roleId) : null;
          const isSuperAdmin = !!(role && role.is_super_admin);

          let all_menu, all_links;
          if (isSuperAdmin) {
            // Super Admin: a normal, visible role attribute (role_master.is_super_admin, set
            // from the Role Master screen) - not a hidden bypass. Grants full view/add/edit/
            // delete/excel/pdf/approve/mailsent access to every row in menu_master and every
            // link in link_master, with no menu_permission/link_permission rows required, so a
            // menu added after this role was created is automatically included on next login.
            const allMenuSQL = `SELECT mm.*, mm.id as mm_id,
                                        1 as add_opt, 1 as edit_opt, 1 as view_opt, 1 as delete_opt,
                                        1 as excel_opt, 1 as pdf_opt, 1 as approve_opt, 1 as mailsent_opt,
                                        0 as password_protect_opt
                                        FROM menu_master AS mm
                                        ORDER BY mm.parent_rank ASC, mm.child_rank ASC;`;
            const allMenuResult = await sequelize.query(allMenuSQL, { type: QueryTypes.SELECT });
            let parents_arr = allMenuResult.filter((o) => o.parent_id == null);
            all_menu = recursion(parents_arr, allMenuResult);
            all_links = JSON.stringify(await getAllLinks());
          } else {
            let menuPermissionSQL = `SELECT mm.*, mm.id as mm_id,
                                          mp.id as mp_id, mp.menu_id as mp_menu_id,
                                          mp.role_id as mp_role_id, mp.user_id as mp_user_id,
                                          mp.add_opt, mp.edit_opt, mp.view_opt, mp.delete_opt,
                                          mp.excel_opt, mp.pdf_opt, mp.approve_opt, mp.mailsent_opt,
                                          mp.password_protect_opt
                                          FROM menu_master AS mm
                                          LEFT JOIN menu_permission AS mp ON mp.menu_id = mm.id
                                          WHERE mp.role_id = :roleId AND mp.user_id = :userId
                                          AND mp.view_opt = 1
                                          ORDER BY mm.parent_rank ASC, mm.child_rank ASC;`;
            const result = await sequelize.query(menuPermissionSQL, {
              type: QueryTypes.SELECT,
              replacements: { roleId, userId },
            });
            let parents_arr = result.filter((o) => o.parent_id == null);
            all_menu = recursion(parents_arr, result);
            var get_links = await getlink(roleId, userId);
            all_links = JSON.stringify(get_links);
          }
          // Plain objects (not the raw Sequelize instances) so is_super_admin can be layered on
          // top - the frontend uses this to decide whether the Super Admin checkbox/column on
          // Role Master is even shown, so a non-super-admin can't see the option exists.
          const userDetPayload = resUsersMaster.map((u) => u.get({ plain: true }));
          userDetPayload[0].is_super_admin = isSuperAdmin;

          // Password-expiry reminder - null unless the password will expire within the next
          // PASSWORD_EXPIRY_REMINDER_DAYS days (cron/jobs/enforcePasswordExpiry.js flips
          // must_change_password once it actually hits PASSWORD_MAX_AGE_DAYS old, which already
          // blocks the dashboard redirect on its own - if that's already true there's nothing
          // to warn about, they're already in that flow). Computed here, not on the frontend, so
          // the policy's day counts stay defined in exactly one place (passwordPolicy.js).
          userDetPayload[0].password_expires_in_days = null;
          if (!user.must_change_password && user.last_password_modified) {
            const ageDays = Math.floor(
              (Date.now() - new Date(user.last_password_modified).getTime()) / 86400000
            );
            const daysLeft = PASSWORD_MAX_AGE_DAYS - ageDays;
            if (daysLeft > 0 && daysLeft <= PASSWORD_EXPIRY_REMINDER_DAYS) {
              userDetPayload[0].password_expires_in_days = daysLeft;
            }
          }

          var finalData = {
            userDet: userDetPayload,
            menuDet: all_menu,
            links: all_links,
          };


          var finalUserData = { userDet: resUsersMaster };
          let tokenUser = jwt.sign(finalUserData, process.env.SECRET_KEY, {
            expiresIn: "10h",
          });
          finalData.userDettoken = tokenUser;
          await resetLoginRateLimit(loginIp);
          try {
            await recordLogin(req, user.id);
          } catch (e) {
            logger.error(`Failed to record login activity: ${e.message}`);
          }
          return res.status(200).send({ data: finalData });
        } else {
          // Admin password also failed — increment incorrect_password_attempts
          let attempts = user.incorrect_password_attempts + 1;
          let updateData = { incorrect_password_attempts: attempts };
          await recordLoginFailure(loginIp);

          // Lock account if attempts >= 3
          if (attempts >= 3) {
            updateData.account_block = true;
            logger.warn(`Account locked for user: ${email} after 3 failed attempts.`);
            await usersMaster.update(updateData, { where: { id: user.id } });
            await blockUser(user.id);

            try {
              await sendAccountLockedMail(user, attempts);
            } catch (e) {
              logger.error(`Failed to send account-locked notification: ${e.message}`);
            }
            return res.status(403).send({
              message:
                "Account locked due to multiple incorrect password attempts. mail sent for reset password.",
            });
          } else {
            await usersMaster.update(updateData, { where: { id: user.id } });
            logger.warn(`Incorrect password attempt ${attempts} for user: ${email}`);
            return res.status(401).send(responseCodes.UNAUTHORIZED);
          }
        }
      } else {
        logger.warn(`User not found: ${email}`);
        await recordLoginFailure(loginIp);
        return res.status(404).send({
          ...responseCodes.NOT_FOUND,
          message: `User not found: ${email}`,
        });
      }
    } else {
      logger.warn(`Invalid request data`);
      return res.status(400).send(responseCodes.BAD_REQUEST);
    }
  } catch (e) {
    logger.error(`Unexpected error: ${e.message}`);
    return res.status(500).send(responseCodes.INTERNAL_SERVER_ERROR);
  }
});

// Not behind jwtTokenValiadtion (logout must work even against an expired/near-expired token) -
// verifies the token itself. Revokes it into Redis for the rest of its natural life so it can't be
// reused (e.g. replayed from a stolen copy) after the user has explicitly logged out, closing the
// other half of the gap alongside the account-lock check in jwtTokenValiadtion.js.
routers.post("/logout", async (req, res) => {
  const token = req.headers.webtoken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const remainingSeconds = decoded.exp - Math.floor(Date.now() / 1000);
      await revokeToken(token, remainingSeconds);
    } catch (e) {
      // Already invalid/expired - nothing left to revoke.
    }
  }
  return res.status(200).send({ code: "100", message: "Logged out." });
});

// Pre-auth: the login page has no JWT yet, so it can't hit the authenticated
// /api/developerTools/clientBranding/getOneRow route the topbar uses post-login. Whitelists
// just the two display fields the login page needs - never the full row (which also holds
// support_email/support_phone/website, no reason to expose those before a user has signed in).
routers.get("/public_branding", async (req, res) => {
  try {
    const branding = await clientBrandingMaster.findOne({
      where: { id: 1 },
      attributes: ["client_name", "client_logo"],
    });
    return res.status(200).json({ success: true, data: branding || {} });
  } catch (error) {
    logger.error(`public_branding error: ${error.message}`);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

routers.post("/forgot_password_request", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await usersMaster.findOne({
      where: {
        [Sequelize.Op.or]: [{ email }, { work_email: email }],
        status: true,
      },
    });
    if (!user) {
      // Return success to avoid user enumeration
      return res.status(200).json({ success: true, message: "If that email exists, an OTP has been sent." });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await usersMaster.update(
      { reset_otp: otp, reset_otp_expiry: expiry },
      { where: { id: user.id } }
    );

    await sendOtpMail(email, otp, OTP_EXPIRY_MINUTES);
    logger.info(`OTP sent for password reset: ${email}`);
    return res.status(200).json({ success: true, message: "If that email exists, an OTP has been sent." });
  } catch (error) {
    logger.error(`forgot_password_request error: ${error.message}`);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

routers.post("/forgot_password", async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: "Email, OTP, and new password are required." });
    }

    const user = await usersMaster.findOne({
      where: {
        [Sequelize.Op.or]: [{ email }, { work_email: email }],
        status: true,
      },
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const data = user.dataValues;
    if (!data.reset_otp || data.reset_otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }
    if (!data.reset_otp_expiry || new Date() > new Date(data.reset_otp_expiry)) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await usersMaster.update(
      {
        password: hashedPassword,
        reset_otp: null,
        reset_otp_expiry: null,
        account_block: false,
        incorrect_password_attempts: 0,
        must_change_password: false,
        last_password_modified: new Date(),
      },
      { where: { id: data.id } }
    );
    await unblockUser(data.id);

    logger.info(`Password reset successful for: ${email}`);
    return res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    logger.error(`forgot_password error: ${error.message}`);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});
routers.post("/register", async (req, res) => {
  try {
    const { email, password, first_name, last_name, mobile, designation_id, role_id } = req.body;
    if (!email || !password || !first_name || !last_name || !mobile || !designation_id || !role_id) {
      return res.status(400).send(responseCodes.BAD_REQUEST);
    }

    const existing = await usersMaster.findOne({ where: { email } });
    if (existing) {
      return res.status(409).send({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    await usersMaster.create({
      email,
      password: hash,
      first_name,
      last_name,
      mobile,
      designation_id,
      role_id,
      status: true,
      incorrect_password_attempts: 0,
      account_block: false,
      sidebar_lock: false,
      created_date: new Date(),
    });
    logger.info(`User registered: ${email}`);
    return res.status(201).send({ message: "User registered successfully" });
  } catch (e) {
    logger.error(`Registration error: ${e.message}`);
    return res.status(500).send(responseCodes.INTERNAL_SERVER_ERROR);
  }
});

routers.post("/set_admin_password", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    await systemConfig.upsert({
      config_key: "admin_password",
      config_value: hashed,
      updated_at: new Date(),
    });

    logger.info("Admin master password updated.");
    return res.status(200).json({ success: true, message: "Admin password set successfully." });
  } catch (error) {
    logger.error(`set_admin_password error: ${error.message}`);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

function recursion(get_parents, arr) {
  let final_arr = [];
  for (let elem of get_parents) {
    let router_link_arr = [];
    router_link_arr.push(elem.link);
    let child_arr = [];
    for (let elem_child of arr) {
      if (elem_child.parent_id == elem.mm_id) {
        child_arr.push(elem_child);
      }
    }
    let child_arr_new = child_arr.sort((a, b) => a.child_rank - b.child_rank);
    let menu_obj = {};
    if (child_arr_new.length > 0) {
      menu_obj = {
        main_parent: 0,
        label: elem.menu_name,
        icon: elem.icon,
        routerLink: router_link_arr,
        add_opt: elem.add_opt,
        edit_opt: elem.edit_opt,
        view_opt: elem.view_opt,
        delete_opt: elem.delete_opt,
        excel_opt: elem.excel_opt,
        pdf_opt: elem.pdf_opt,
        approve_opt: elem.approve_opt,
        mailsent_opt: elem.mailsent_opt,
        password_protect_opt: elem.password_protect_opt,
        items: recursion(child_arr_new, arr),
      };
    } else {
      menu_obj = {
        main_parent: 0,
        label: elem.menu_name,
        icon: elem.icon,
        routerLink: router_link_arr,
        add_opt: elem.add_opt,
        edit_opt: elem.edit_opt,
        view_opt: elem.view_opt,
        delete_opt: elem.delete_opt,
        excel_opt: elem.excel_opt,
        pdf_opt: elem.pdf_opt,
        approve_opt: elem.approve_opt,
        mailsent_opt: elem.mailsent_opt,
        password_protect_opt: elem.password_protect_opt,
      };
    }
    final_arr.push(menu_obj);
  }

  return final_arr;
}

async function getlink(role_id, user_id) {
  try {
    let sql = `select mm.id as menu_id, mm.menu_name,mm.link,lm.link_name from menu_master as mm
        left join link_master as lm on mm.id=lm.menu_id
        left join link_permission as lp on lm.id=lp.link_id
        where lp.role_id = :role_id AND lp.user_id = :user_id`;
    const linkResults = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
      replacements: { role_id, user_id },
    });
    let result = groupBy(linkResults, (item) => {
      return [item.link];
    });
    return result;
  } catch (e) {
    logger.error(`Error fetching links: ${e.message}`);
    return [];
  }
}

// Super Admin counterpart to getlink() - every defined link in link_master, for every menu,
// with no link_permission row required.
async function getAllLinks() {
  try {
    let sql = `select mm.id as menu_id, mm.menu_name, mm.link, lm.link_name from menu_master as mm
        left join link_master as lm on mm.id=lm.menu_id
        where lm.link_name IS NOT NULL`;
    const linkResults = await sequelize.query(sql, { type: QueryTypes.SELECT });
    return groupBy(linkResults, (item) => {
      return [item.link];
    });
  } catch (e) {
    logger.error(`Error fetching all links (super admin): ${e.message}`);
    return [];
  }
}
routers.post("/default_password", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return res.status(200).json({ success: true, hash });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}); 
function groupBy(array, f) {
  let groups = {};
  array.forEach((o) => {
    var group = f(o).join("-");
    groups[group] = groups[group] || [];
    groups[group].push(o.link_name);
  });
  return groups;
}

module.exports = routers;
