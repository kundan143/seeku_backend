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
const { usersMaster } = require("../models");

const SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 15;

routers.post("/user_login", async (req, res) => {
  try {
    if (req.body && req.body.email && req.body.password) {
      let email = req.body.email;
      let password = req.body.password;

      let resUsersMaster = await usersMaster.findAll({
        where: { email: email, status: true },
      });

      if (resUsersMaster.length > 0) {
        const user = resUsersMaster[0].dataValues;

        // Check if account is blocked
        if (user.account_block) {
          return res.status(403).send({
            message:
              "Account locked due to multiple incorrect password attempts. mail sent for reset password.",
          });
        }

        let db_password = user.password;
        const resBcrypt = await bcrypt.compare(password, db_password);

        if (resBcrypt) {
          if (user.incorrect_password_attempts > 0) {
            await usersMaster.update(
              { incorrect_password_attempts: 0 },
              { where: { id: user.id } },
            );
          }

          let designationId = user.designation_id;
          let userId = user.id;

          let menuPermissionSQL = `SELECT mm.*, mm.id as mm_id,
                                        mp.id as mp_id, mp.menu_id as mp_menu_id,
                                        mp.designation_id as mp_designation_id, mp.user_id as mp_user_id,
                                        mp.add_opt, mp.edit_opt, mp.view_opt, mp.delete_opt
                                        FROM menu_master AS mm
                                        LEFT JOIN menu_permission AS mp ON mp.menu_id = mm.id
                                        WHERE mp.designation_id = :designationId AND mp.user_id = :userId
                                        AND mp.view_opt = 1
                                        ORDER BY mm.parent_rank ASC, mm.child_rank ASC;`;

          const result = await sequelize.query(menuPermissionSQL, {
            type: QueryTypes.SELECT,
            replacements: { designationId, userId },
          });
          let parents_arr = result.filter((o) => o.parent_id == null);
          let menu_details = recursion(parents_arr, result);
          let all_menu = menu_details;

          var get_links = await getlink(designationId, userId);
          var all_links = JSON.stringify(get_links);

          var finalData = {
            userDet: resUsersMaster,
            menuDet: all_menu,
            links: all_links,
          };
         

          var finalUserData = { userDet: resUsersMaster };

          let tokenUser = jwt.sign(finalUserData, process.env.SECRET_KEY, {
            expiresIn: "10h",
          });

          finalData.userDettoken = tokenUser;
           console.log(finalData.userDettoken ,"kundan")
          return res.status(200).send({ data: finalData });
        } else {
          // Increment incorrect_password_attempts
          let attempts = user.incorrect_password_attempts + 1;
          let updateData = { incorrect_password_attempts: attempts };

          // Lock account if attempts >= 3
          if (attempts >= 3) {
            updateData.account_block = true;
            logger.warn(`Account locked for user: ${email} after 3 failed attempts.`,
            );
            await usersMaster.update(updateData, { where: { id: user.id } });
            return res.status(403).send({
              message:
                "Account locked due to multiple incorrect password attempts. mail sent for reset password.",
            });
          } else {
            await usersMaster.update(updateData, { where: { id: user.id } });
            logger.warn(
              `Incorrect password attempt ${attempts} for user: ${email}`,
            );
            return res.status(401).send(responseCodes.UNAUTHORIZED);
          }
        }
      } else {
        logger.warn(`User not found: ${email}`);
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

routers.post("/forgot_password_request", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await usersMaster.findOne({ where: { email, status: true } });
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

    const user = await usersMaster.findOne({ where: { email, status: true } });
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
      { password: hashedPassword, reset_otp: null, reset_otp_expiry: null, account_block: false, incorrect_password_attempts: 0, last_password_modified: new Date() },
      { where: { id: data.id } }
    );

    logger.info(`Password reset successful for: ${email}`);
    return res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    logger.error(`forgot_password error: ${error.message}`);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});
routers.post("/register", async (req, res) => {
  try {
    const { email, password, first_name, last_name, mobile, username, designation_id, role_id } = req.body;
    if (!email || !password || !first_name || !last_name || !mobile || !username || !designation_id || !role_id) {
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
      username,
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
      };
    }
    final_arr.push(menu_obj);
  }

  return final_arr;
}

async function getlink(designation_id, user_id) {
  try {
    let sql = `select mm.id as menu_id, mm.menu_name,mm.link,lm.link_name from menu_master as mm
        left join link_master as lm on mm.id=lm.menu_id
        left join link_permission as lp on lm.id=lp.link_id
        where lp.designation_id = :designation_id AND lp.user_id = :user_id`;
    const linkResults = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
      replacements: { designation_id, user_id },
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
