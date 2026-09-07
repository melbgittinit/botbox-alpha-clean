import { spawnSync } from "node:child_process";

const identity = process.env.BOT_FACTORY_DB_IDENTITY;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("FACTORY_SCHEMA_BLOCKED: DATABASE_URL is not configured.");
  process.exit(2);
}

if (identity !== "bot-factory-revenue") {
  console.error("FACTORY_SCHEMA_BLOCKED: BOT_FACTORY_DB_IDENTITY must equal bot-factory-revenue.");
  process.exit(3);
}

console.log("FACTORY_SCHEMA_GATE_OK: deploying Prisma schema to the explicitly identified Factory revenue database.");
const result = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["prisma", "db", "push"], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  console.error(result.error);
  process.exit(4);
}

process.exit(result.status ?? 1);
