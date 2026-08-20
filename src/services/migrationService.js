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

// Migrations numbered at or below this were applied by hand to this database
// before this auto-runner existed, and most aren't idempotent (no IF NOT
// EXISTS / IF EXISTS guards) — replaying them would fail or re-run destructive
// renames/backfills. On every boot, anything <= BASELINE_CUTOFF that shows up
// as "pending" (e.g. a fresh clone, or first boot on this DB) gets marked as
// already-applied WITHOUT executing it. Anything above the cutoff is a real
// new migration and gets executed normally. This makes the baseline step
// permanent and automatic instead of a one-off manual script.
const BASELINE_CUTOFF = 57;

function getMigrationNumber(fileName) {
  const match = fileName.match(/^(\d+)_/);
  return match ? parseInt(match[1], 10) : null;
}

async function runMigrations() {
  const pendingRaw = await umzug.pending();
  if (!pendingRaw.length) {
    logger.info("No pending SQL migrations.");
    return;
  }

  // umzug.pending() orders by filename as a STRING, so "100_..." sorts before "70_..." (as
  // characters, "1" < "7") - dead wrong once migration numbers cross a digit-count boundary,
  // and exactly how a numbered-after-97 migration can run before the migration that creates the
  // table it ALTERs. Re-sort numerically by the leading number before doing anything else.
  const pending = [...pendingRaw].sort(
    (a, b) => (getMigrationNumber(a.file) ?? 0) - (getMigrationNumber(b.file) ?? 0)
  );

  const toBaseline = pending.filter((m) => {
    const num = getMigrationNumber(m.file);
    return num !== null && num <= BASELINE_CUTOFF;
  });
  const toRun = pending.filter((m) => !toBaseline.includes(m));

  if (toBaseline.length) {
    logger.info(
      `Marking ${toBaseline.length} pre-existing migration(s) as already applied (baseline, not executed): ${toBaseline
        .map((m) => m.file)
        .join(", ")}`
    );
    for (const migration of toBaseline) {
      await umzug.storage.logMigration(migration.file);
    }
  }

  if (toRun.length) {
    logger.info(
      `Applying ${toRun.length} pending SQL migration(s) in numeric order: ${toRun.map((m) => m.file).join(", ")}`
    );
    // One at a time, in our own numeric order - umzug.up({migrations: [...]}) is not guaranteed
    // to execute in the order of the array passed in (it runs them in umzug's own pending-list
    // order), so a single batch call here would silently reintroduce the same ordering bug.
    for (const migration of toRun) {
      await umzug.up({ migrations: [migration.file] });
    }
    logger.info("SQL migrations applied successfully.");
  }
}

module.exports = { umzug, runMigrations };
