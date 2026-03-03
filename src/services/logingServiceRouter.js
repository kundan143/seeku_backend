const express = require("express");
const routers = express.Router();
const bcrypt = require("bcryptjs");
const lo = require("lodash");
const jwt = require("jsonwebtoken");
const mt = require("moment-timezone");
process.env.SECRET_KEY = "secret";
const logger = require("./dailyLogService");
const { Sequelize, Model, DataTypes, QueryTypes } = require("sequelize");
const { responseCodes } = require("./baseReponse");
const { sequelize } = require("../config/database-connection");
const sendForgotPasswordMail = require("./sendForgotPasswordMail");
const { usersMaster } = require("../models");

const SALT_ROUNDS = 12;

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
              { where: { id: user.id } }
            );
          }

          let designationId = user.designation_id;
          let userId = user.id;

          let menuPermissionSQL = `SELECT mm.*, mm.id as mm_id, mp.*, mp.id as mp_id
                                        FROM menu_master AS mm
                                        LEFT JOIN menu_permission AS mp ON mp.menu_id = mm.id
                                        WHERE mp.designation_id = ${designationId} AND  mp.user_id = ${userId}
                                        AND mp.view_opt = 1
                                        ORDER BY mm.parent_rank ASC, mm.child_rank ASC;`;

          const result = await sequelize.query(menuPermissionSQL, {
            type: QueryTypes.SELECT,
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
          return res.status(200).send({ data: finalData });
        } else {
          // Increment incorrect_password_attempts
          let attempts = user.incorrect_password_attempts + 1;
          let updateData = { incorrect_password_attempts: attempts };

          // Lock account if attempts >= 3
          if (attempts >= 3) {
            updateData.account_block = true;
            logger.warn(
              `Account locked for user: ${email} after 3 failed attempts.`
            );
            await usersMaster.update(updateData, { where: { id: user.id } });
            return res.status(403).send({
              message:
                "Account locked due to multiple incorrect password attempts. mail sent for reset password.",
            });
          } else {
            await usersMaster.update(updateData, { where: { id: user.id } });
            logger.warn(
              `Incorrect password attempt ${attempts} for user: ${email}`
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
    console.log(e)
    logger.error(`Unexpected error: ${e.message}`);
    return res.status(500).send(responseCodes.INTERNAL_SERVER_ERROR);
  }
});

routers.post("/test_bcrypt", async (req, res) => {
  try {
    if (req.body && req.body.password) {
      let plainPassword = req.body.password;

      // Generate salt and hash the password
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(plainPassword, salt);

      logger.info(`Password hashed successfully`);

      return res.status(200).send({ hashedPassword: hash });
    } else {
      logger.warn(`Password not provided in request`);
      return res.status(400).send(responseCodes.BAD_REQUEST);
    }
  } catch (e) {
    logger.error(`Error hashing password: ${e.message}`);
    return res.status(500).send(responseCodes.INTERNAL_SERVER_ERROR);
  }
});
routers.post("/register", async (req, res) => {
  try {
    if (req.body && req.body.email && req.body.password) {
      const email = req.body.email;
      const password = req.body.password;

      // Strong bcrypt hash
      const hash = await bcrypt.hash(password, SALT_ROUNDS);

      // let db_password = "Kundan@8383"
      // const salt = bcrypt.genSaltSync(12);
      // const hash = bcrypt.hashSync(db_password, salt);
      // console.log(hash);
      // Save hash to DB

      // Login
      // const resBcrypt = await bcrypt.compare(password, hash);
      // console.log(resBcrypt);
      // Use await for bcrypt.compare
      // Save email and hash to DB (example, adjust for your ORM)
      await usersMaster.create({
        email,
        password: hash,
        designation_id: 2,
        mobile: 861234567890,
        username: "aaa",
        first_name: "John",
        last_name: "Doe",
        designation_id, // <-- Now provided from request
        status: 1,
        incorrect_password_attempts: 0,
        account_block: false,
        sidebar_lock: false,
      });
      logger.info(`User registered: ${email}`);
      return res.status(201).send({ message: "User registered successfully" });
    } else {
      logger.warn(`Invalid registration data`);
      return res.status(400).send(responseCodes.BAD_REQUEST);
    }
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
        items: recursion(child_arr_new, arr),
      };
    } else {
      menu_obj = {
        main_parent: 0,
        label: elem.menu_name,
        icon: elem.icon,
        routerLink: router_link_arr,
      };
    }
    final_arr.push(menu_obj);
  }

  return final_arr;
}

function getlink(designation_id, user_id) {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = `select mm.id as menu_id, mm.menu_name,mm.link,lm.link_name from menu_master as mm 
        left join link_master as lm on mm.id=lm.menu_id 
        left join link_permission as lp on lm.id=lp.link_id 
        where  lp.designation_id=${designation_id} AND lp.user_id = ${user_id}`;
      const linkResults = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
      });
      let result = groupBy(linkResults, (item) => {
        return [item.link];
      });
      resolve(result);
    } catch (e) {
      logger.error(`Error fetching links: ${e.message}`);
      resolve([]);
    }
  });
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
