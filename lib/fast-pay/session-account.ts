import { prisma } from "../prisma";
import { resolveHubUser } from "../hub-auth/session";
import { FastPayError, fastPayEnabled } from "./core";

export async function resolveFastPayAccount(request: Request) {
  if (!fastPayEnabled()) {
    throw new FastPayError(503, "FAST_PAY_DISABLED", "FAST PAY is not enabled.");
  }

  const user = await resolveHubUser(request);
  if (!user) {
    throw new FastPayError(401, "SIGN_IN_REQUIRED", "Sign in to use FAST PAY.");
  }

  const account = await prisma.fastPayAccount.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  return { user, account };
}
