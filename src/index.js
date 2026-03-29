const express = require("express");
const { Sequelize } = require("sequelize");
const lodash = require("lodash");
const loginServiceRouter = require("./services/logingServiceRouter");
const jwtTokenValiadtion = require("./services/jwtTokenValiadtion");
const cors = require("cors");
const logger = require("./services/dailyLogService");
require("dotenv").config();
const app = express();
const PORT = 3000;
const fs = require("fs");
const path = require("path");

// Middleware

// Routes
const SERVER = process.env.SERVER || `LOCAL`;

const startServer = async () => {
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ extended: true, limit: "100mb" }));
  app.use(cors());
  app.use(express.static(__dirname + "/public"));
  app.use((req, res, next) => {
    let obj = lodash.cloneDeep(req.body);
    if (obj?.password) delete obj.password;
    next();
  });
  app.use("/api", loginServiceRouter);
  require("./api/developer-tools")(app, jwtTokenValiadtion);
  require("./api/masters")(app, jwtTokenValiadtion);
  require("./api/organizations")(app, jwtTokenValiadtion);
  require("./api/hr")(app, jwtTokenValiadtion);
  require("./api/design-costing")(app, jwtTokenValiadtion);
  require("./api/sales")(app, jwtTokenValiadtion);
  require("./api/fee-management")(app, jwtTokenValiadtion);

  app.use((req, res, next) => {
    const logData = {
      timestamp: new Date().toLocaleString(),
      originalUrl: req.originalUrl,
      method: req.method,
      headers: req.headers,
      params: req.params,
      body: req.body,
      message: "API Hit",
    };
    const filename = `logs/api-hit-${Date.now()}.log`;
    fs.writeFileSync(
      path.join(__dirname, "..", filename),
      JSON.stringify(logData, null, 2)
    );
    next();
  });

  app
    .listen(`${process.env.MICRO_SERVICE_PORT}`, () => {
      logger.info({
        timestamp: new Date().toLocaleString(),
        message: `Backend Service started on ->`,
        MICRO_SERVICE_NAME: `${process.env.MICRO_SERVICE_NAME}`,
        MICRO_SERVICE_PORT: `${process.env.MICRO_SERVICE_PORT}`,
        env: `${SERVER}`,
        mode: `${
          process.env.NODE_APP_INSTANCE ? "CLUSTER_MODE" : "SINGLE_CORE"
        }`,
        instanceId: `${
          process.env.NODE_APP_INSTANCE ? process.env.NODE_APP_INSTANCE : "NA"
        }`,
      });

      logger.info(
        `${process.env.MICRO_SERVICE_NAME} Microservice Listening on port ${process.env.MICRO_SERVICE_PORT}`
      );
    })
    .on("error", (e) => {
      logger.error(e, "ERROR");
      process.nextTick(function () {
        throw new Error(JSON.stringify(e));
      });
      process.exit();
    });
};

startServer();
