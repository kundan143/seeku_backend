require("dotenv").config();
const { Sequelize } = require("sequelize");
const logger = require("../services/dailyLogService");

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DB_USER,
  process.env.PASSWORD,
  {
    dialect: process.env.DIALECT,
    host: process.env.HOST,
    port: Number(process.env.DB_PORT),
    pool: {
      max: 81,
      min: 0,
      idle: 10000,
    },
    timezone: "+01:00",
  }
);

sequelize
  .authenticate()
  .then(() => {
    logger.info(
      `${process.env.DATABASE} : ${process.env.HOST} : ${process.env.MICRO_SERVICE_NAME} Connection established successfully`
    );
  })
  .catch((e) => {
    logger.error(
      `Unable to connect to the ${process.env.MICRO_SERVICE_NAME} database: `,
      e
    );
  });

let db_prod = {};

if (process.env.PROD_DATABASE) {
  db_prod = new Sequelize(
    process.env.PROD_DATABASE,
    process.env.PROD_DB_USER,
    process.env.PROD_PASSWORD,
    {
      dialect: process.env.PROD_DIALECT,
      host: process.env.PROD_HOST,
      port: Number(process.env.PROD_DB_PORT), // <-- Corrected here
      pool: {
        max: 81,
        min: 0,
        idle: 10000,
      },
      timezone: "+01:00",
    }
  );

  db_prod
    .authenticate()
    .then(() => {
      logger.info(
        `${process.env.PROD_DATABASE} : ${process.env.PROD_HOST} : ${process.env.MICRO_SERVICE_NAME} Connection established successfully`
      );
    })
    .catch((e) => {
      logger.error(
        `Unable to connect to the ${process.env.MICRO_SERVICE_NAME} database: `,
        e
      );
    });
}

module.exports = {
  sequelize,
  db_prod,
};
