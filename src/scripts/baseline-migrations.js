// One-time setup: marks every SQL file already present in src/sql as "already
// applied" in SequelizeMeta, without executing it, since this database has had
// them applied by hand up to this point. Run this ONCE, before the app's
// automatic migration runner (src/services/migrationService.js) goes live —
// otherwise it will try to re-run every historical .sql file on next boot.
//
// Usage: node src/scripts/baseline-migrations.js
require("dotenv").config();
const { umzug } = require("../services/migrationService");

(async () => {
  const pending = await umzug.pending();
  if (!pending.length) {
    console.log("Nothing to baseline — no pending migrations found.");
    process.exit(0);
  }
  for (const migration of pending) {
    await umzug.storage.logMigration(migration.file);
    console.log(`Marked as already applied: ${migration.file}`);
  }
  console.log(
    `Baseline complete. ${pending.length} migration(s) marked as applied without running.`
  );
  process.exit(0);
})().catch((e) => {
  console.error("Baseline failed:", e);
  process.exit(1);
});
