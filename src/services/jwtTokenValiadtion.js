const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const logger = require("../services/dailyLogService");
const { isTokenRevoked, isUserBlocked } = require("../services/sessionSecurity");

const jwtTokenValiadtion = async function (req, res, next) {
  logger.info("Middleware : Token Validation Request Header :", req.headers);
  let token = req.headers.webtoken;

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (
      decoded &&
      decoded.userDet &&
      decoded.userDet[0] &&
      decoded.userDet[0].id
    ) {
      const userId = decoded.userDet[0].id;
      if (await isTokenRevoked(token)) {
        logger.info("Middleware : Token revoked (logged out), access Denied");
        return res.status(401).send({
          message: "danger",
          code: "TOKEN_INVALID",
          data: "Session ended, please log in again",
        });
      }
      if (await isUserBlocked(userId)) {
        logger.info("Middleware : Account locked, access Denied");
        return res.status(401).send({
          message: "danger",
          code: "TOKEN_INVALID",
          data: "This account has been locked",
        });
      }
      req.headers.userId = userId;
      logger.info("Middleware : Valid token access granted");
      next();
    } else {
      logger.info("Middleware : Invalid token, access Denied");
      return res.status(401).send({
        message: "danger",
        code: "TOKEN_INVALID",
        data: "Invalid token, access Denied",
      });
    }
  } catch (err) {
    logger.info("Middleware : Invalid token, unable to decode");
    return res.status(401).send({
      message: "danger",
      code: "TOKEN_INVALID",
      data: "Invalid Token, unable to decode",
    });
  }
};

module.exports = jwtTokenValiadtion;
