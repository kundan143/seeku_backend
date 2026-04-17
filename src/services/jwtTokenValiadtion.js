const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const logger = require("../services/dailyLogService");

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
      req.headers.userId = decoded.userDet[0].id;
      logger.info("Middleware : Valid token access granted");
      next();
    } else {
      logger.info("Middleware : Invalid token, access Denied");
      res.send({
        message: "danger",
        code: "201",
        data: "Invalid token, access Denied",
      });
    }
  } catch (err) {
    logger.info("Middleware : Invalid token, unable to decode");
    res.send({
      message: "danger",
      code: "201",
      data: "Invalid Token, unable to decode",
    });
  }
};

module.exports = jwtTokenValiadtion;
