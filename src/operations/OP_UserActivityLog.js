const { userActivityLog } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

const SENSITIVE_KEYS = ["password", "confirm_password", "old_password", "new_password", "token", "userdettoken", "otp", "reset_otp"];

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || null;
}

function sanitizeBody(body) {
  if (!body || typeof body !== "object" || !Object.keys(body).length) return null;
  const strip = (value) => {
    if (Array.isArray(value)) return value.map(strip);
    if (value && typeof value === "object") {
      const out = {};
      for (const key of Object.keys(value)) {
        out[key] = SENSITIVE_KEYS.includes(key.toLowerCase()) ? "[REDACTED]" : strip(value[key]);
      }
      return out;
    }
    return value;
  };
  return strip(body);
}

exports.recordEvent = async function ({ user_id, event_type, module_name, route_path, page_title, method, request_body, ip_address, user_agent }) {
  return userActivityLog.create({
    user_id: user_id || null,
    event_type,
    module_name: module_name || null,
    route_path: route_path || null,
    page_title: page_title || null,
    method: method || null,
    request_body: request_body || null,
    ip_address: ip_address || null,
    user_agent: user_agent || null,
    created_date: new Date(),
  });
};

exports.recordApiCall = async function (req) {
  const segments = (req.originalUrl || "").split("?")[0].split("/").filter(Boolean);
  return exports.recordEvent({
    user_id: req.headers.userId,
    event_type: "api_call",
    module_name: segments[1] || null,
    route_path: req.originalUrl,
    method: req.method,
    request_body: sanitizeBody(req.body),
    ip_address: clientIp(req),
    user_agent: req.headers["user-agent"],
  });
};

exports.recordLogin = async function (req, userId) {
  return exports.recordEvent({
    user_id: userId,
    event_type: "login",
    ip_address: clientIp(req),
    user_agent: req.headers["user-agent"],
  });
};

exports.logEvent = async function (req) {
  try {
    const { event_type, module_name, route_path, page_title } = req.body;
    if (!["login", "logout", "page_visit"].includes(event_type)) {
      responseCodes.BAD_REQUEST.data = null;
      responseCodes.BAD_REQUEST.message = "Invalid event_type";
      return responseCodes.BAD_REQUEST;
    }

    await exports.recordEvent({
      user_id: req.headers.userId,
      event_type,
      module_name,
      route_path,
      page_title,
      ip_address: clientIp(req),
      user_agent: req.headers["user-agent"],
    });

    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to record activity event";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getAllData = async function (body) {
  try {
    const conditions = [];
    const replacements = {};

    if (body?.user_id) {
      conditions.push("ual.user_id = :user_id");
      replacements.user_id = body.user_id;
    }
    if (body?.event_type) {
      conditions.push("ual.event_type = :event_type");
      replacements.event_type = body.event_type;
    }
    if (body?.from_date) {
      conditions.push("ual.created_date >= :from_date");
      replacements.from_date = body.from_date;
    }
    if (body?.to_date) {
      conditions.push("ual.created_date <= :to_date");
      replacements.to_date = body.to_date;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT ual.*,
             CONCAT(um.first_name, ' ',um.middle_name, ' ',um.last_name) AS user_name
      FROM user_activity_log ual
      LEFT JOIN users_master um ON um.id = ual.user_id
      ${where}
      ORDER BY ual.created_date DESC
      LIMIT 1000`;

    const data = await sequelize.query(query, { replacements, type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Activity Log";
    return responseCodes.BAD_REQUEST;
  }
};
