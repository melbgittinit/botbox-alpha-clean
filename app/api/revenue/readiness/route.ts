import { NextResponse } from "next/server";

export async function GET() {
  const databaseConfigured = Boolean(process.env.DATABASE_URL);
  const identityLocked = process.env.BOT_FACTORY_DB_IDENTITY === "bot-factory-revenue";

  return NextResponse.json(
    {
      ok: databaseConfigured && identityLocked,
      mode: databaseConfigured && identityLocked ? "FACTORY_DB_READY" : "STAGING_NO_PERSISTENCE",
      databaseConfigured,
      identityLocked,
      requiredIdentity: "bot-factory-revenue",
      schemaDeployCommand: "npm run prisma:deploy:factory",
      note: databaseConfigured && !identityLocked
        ? "DATABASE_URL exists but persistence is blocked until BOT_FACTORY_DB_IDENTITY is explicitly set."
        : !databaseConfigured
          ? "No Factory revenue database is attached."
          : "Dedicated Factory revenue database gate is satisfied.",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
