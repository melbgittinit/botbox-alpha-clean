import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const actions = [
  { key: "creator.export", singularLabel: "Product Export", pluralLabel: "Product Exports", defaultCost: 1 },
  { key: "music.download", singularLabel: "Song Download", pluralLabel: "Song Downloads", defaultCost: 1 },
  { key: "event.print_ready", singularLabel: "Print-Ready Edition", pluralLabel: "Print-Ready Editions", defaultCost: 1 },
];

const offers = [
  { key: "creator.export.single", name: "1 Product Export", amountCents: 199, actionKey: "creator.export", grantUnits: 1, offerStyle: "BUY" },
  { key: "creator.export.pack10", name: "10 Product Exports", amountCents: 999, actionKey: "creator.export", grantUnits: 10, offerStyle: "PACK" },
  { key: "music.download.pack10", name: "10 Song Downloads", amountCents: 999, actionKey: "music.download", grantUnits: 10, offerStyle: "PACK" },
  { key: "event.print_ready.pack5", name: "5 Print-Ready Editions", amountCents: 999, actionKey: "event.print_ready", grantUnits: 5, offerStyle: "PACK" },
];

for (const action of actions) {
  await prisma.fastPayActionDefinition.upsert({
    where: { key: action.key },
    update: action,
    create: action,
  });
}

for (const offer of offers) {
  await prisma.fastPayOffer.upsert({
    where: { key: offer.key },
    update: { ...offer, provider: "STRIPE", currency: "usd", active: false },
    create: { ...offer, provider: "STRIPE", currency: "usd", active: false },
  });
}

console.log("FAST PAY pilot catalog seeded INACTIVE. Review pricing before activating any offer.");
await prisma.$disconnect();
