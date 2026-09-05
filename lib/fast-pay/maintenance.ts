import { prisma } from "../prisma";

export async function releaseExpiredFastPayReservations() {
  const now = new Date();
  const expired = await prisma.fastPayUsageReservation.findMany({
    where: { status: "RESERVED", expiresAt: { lte: now } },
    select: { id: true, accountId: true, entitlementId: true, units: true },
    take: 100,
  });

  let released = 0;

  for (const reservation of expired) {
    const didRelease = await prisma.$transaction(async (tx) => {
      const locked = await tx.fastPayUsageReservation.findFirst({
        where: { id: reservation.id, status: "RESERVED" },
      });
      if (!locked) return false;

      const entitlement = await tx.fastPayEntitlement.findUnique({ where: { id: reservation.entitlementId } });
      if (!entitlement) {
        await tx.fastPayUsageReservation.update({
          where: { id: reservation.id },
          data: { status: "EXPIRED", releasedAt: now },
        });
        return true;
      }

      if (!entitlement.unlimited) {
        const updated = await tx.fastPayEntitlement.update({
          where: { id: entitlement.id },
          data: { unitsRemaining: { increment: reservation.units }, version: { increment: 1 } },
        });

        await tx.fastPayLedgerEntry.create({
          data: {
            accountId: reservation.accountId,
            entitlementId: entitlement.id,
            deltaUnits: reservation.units,
            balanceAfter: updated.unitsRemaining,
            reason: "RESERVATION_EXPIRED_RELEASE",
            referenceType: "RESERVATION",
            referenceId: reservation.id,
            idempotencyKey: `expire-release:${reservation.id}`,
          },
        });
      }

      await tx.fastPayUsageReservation.update({
        where: { id: reservation.id },
        data: { status: "EXPIRED", releasedAt: now },
      });
      return true;
    });

    if (didRelease) released += 1;
  }

  return { scanned: expired.length, released };
}
