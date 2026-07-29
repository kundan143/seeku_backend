const fs = require("fs");
const path = require("path");
const Umzug = require("umzug");
const { sequelize } = require("../config/database-connection");
const logger = require("./dailyLogService");

const SQL_DIR = path.join(__dirname, "..", "sql");

const umzug = new Umzug({
  storage: "sequelize",
  storageOptions: { sequelize },
  logging: (msg) => logger.info(msg),
  migrations: {
    path: SQL_DIR,
    pattern: /\.sql$/,
    customResolver: (filePath) => ({
      up: async () => sequelize.query(fs.readFileSync(filePath, "utf8")),
    }),
  },
});

async function runMigrations() {
  const pending = await umzug.pending();
  if (!pending.length) {
    logger.info("No pending SQL migrations.");
    return;
  }
  logger.info(
    `Applying ${pending.length} pending SQL migration(s): ${pending
      .map((m) => m.file)
      .join(", ")}`
  );
  await umzug.up();
  logger.info("SQL migrations applied successfully.");
}

module.exports = { umzug, runMigrations };
