const bcrypt = require("bcryptjs");
const { menuMaster, menuPermission, usersMaster } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");
const { recordEvent } = require("./OP_UserActivityLog");
const sendComponentLockActivityMail = require("../services/sendComponentLockActivityMail");
const sendComponentLockOpenMail = require("../services/sendComponentLockOpenMail");

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || null;
}

async function countOpens(userId, routePath) {
  const rows = await sequelize.query(
    `SELECT COUNT(*)::int AS open_count FROM user_activity_log
     WHERE event_type = 'component_open' AND user_id = :userId AND route_path = :routePath`,
    { type: QueryTypes.SELECT, replacements: { userId, routePath } }
  );
  return rows[0]?.open_count || 0;
}

exports.verify = async function (req) {
  try {
    const { route_path, email, password } = req.body;
    const userId = req.headers.userId;

    if (!route_path || !email || !password) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "route_path, email and password are required";
      return responseCodes.BAD_REQUEST;
    }

    const menu = await menuMaster.findOne({ where: { link: route_path } });
    if (!menu) {
      responseCodes.NOT_FOUND.data = null;
      responseCodes.NOT_FOUND.message = "Unknown component";
      return responseCodes.NOT_FOUND;
    }

    const permission = await menuPermission.findOne({
      where: { menu_id: menu.id, user_id: userId },
    });
    if (!permission || Number(permission.password_protect_opt) !== 1) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "This component is not password protected for this user";
      return responseCodes.BAD_REQUEST;
    }

    if (menu.lock_locked_until && new Date(menu.lock_locked_until) > new Date()) {
      responseCodes.FORBIDDEN.data = { locked_until: menu.lock_locked_until };
      responseCodes.FORBIDDEN.message = `Too many attempts. Try again after ${new Date(menu.lock_locked_until).toLocaleTimeString()}`;
      return responseCodes.FORBIDDEN;
    }

    const emailMatches = email.trim().toLowerCase() === (menu.lock_email || "").trim().toLowerCase();
    const passwordMatches = menu.lock_password_hash
      ? await bcrypt.compare(password, menu.lock_password_hash)
      : false;

    if (!emailMatches || !passwordMatches) {
      const attempts = (menu.lock_failed_attempts || 0) + 1;
      if (attempts >= MAX_ATTEMPTS) {
        await menu.update({
          lock_failed_attempts: 0,
          lock_locked_until: new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000),
        });
        responseCodes.FORBIDDEN.data = null;
        responseCodes.FORBIDDEN.message = `Too many attempts. Locked for ${LOCKOUT_MINUTES} minutes.`;
        return responseCodes.FORBIDDEN;
      }
      await menu.update({ lock_failed_attempts: attempts });
      responseCodes.UNAUTHORIZED.data = { attempts_remaining: MAX_ATTEMPTS - attempts };
      responseCodes.UNAUTHORIZED.message = "Incorrect email or password";
      return responseCodes.UNAUTHORIZED;
    }

    await menu.update({ lock_failed_attempts: 0, lock_locked_until: null });

    await recordEvent({
      user_id: userId,
      event_type: "component_open",
      module_name: menu.menu_name,
      route_path: menu.link,
      ip_address: clientIp(req),
      user_agent: req.headers["user-agent"],
    });

    const openCount = await countOpens(userId, menu.link);
    const openedAt = new Date();

    if (menu.lock_email) {
      const user = await usersMaster.findOne({ where: { id: userId } });
      const userName = user
        ? [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(" ")
        : "Unknown user";
      const userEmail = user?.email || "";

      try {
        await sendComponentLockOpenMail(menu.lock_email, {
          componentName: menu.menu_name,
          userName,
          userEmail,
          openedAt,
          openCount,
        });
      } catch (mailErr) {
        // Unlock already succeeded and was logged; a mail failure shouldn't fail the verify request.
      }
    }

    responseCodes.SUCCESS.data = { opened_at: openedAt, open_count: openCount };
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to verify component lock";
    return responseCodes.BAD_REQUEST;
  }
};

exports.close = async function (req) {
  try {
    const { route_path, opened_at } = req.body;
    const userId = req.headers.userId;

    if (!route_path) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "route_path is required";
      return responseCodes.BAD_REQUEST;
    }

    const menu = await menuMaster.findOne({ where: { link: route_path } });

    await recordEvent({
      user_id: userId,
      event_type: "component_close",
      module_name: menu?.menu_name,
      route_path,
      ip_address: clientIp(req),
      user_agent: req.headers["user-agent"],
    });

    const openCount = await countOpens(userId, route_path);
    const closedAt = new Date();

    if (menu?.lock_email) {
      const user = await usersMaster.findOne({ where: { id: userId } });
      const userName = user
        ? [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(" ")
        : "Unknown user";
      const userEmail = user?.email || "";
      const openedAtDate = opened_at ? new Date(opened_at) : null;
      const durationMs = openedAtDate ? closedAt.getTime() - openedAtDate.getTime() : null;

      try {
        await sendComponentLockActivityMail(menu.lock_email, {
          componentName: menu.menu_name,
          userName,
          userEmail,
          openedAt: openedAtDate,
          closedAt,
          durationMs,
          openCount,
        });
      } catch (mailErr) {
        // Activity was already logged; a mail failure shouldn't fail the close request.
      }
    }

    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to close component lock session";
    return responseCodes.BAD_REQUEST;
  }
};
