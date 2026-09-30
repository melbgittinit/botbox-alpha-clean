import test from "node:test";
import assert from "node:assert/strict";
import { configureExecutivePersistence, createExecutiveSession, updateOpportunity } from "../src/executive-core.js";

test("executive mutations are written through the persistence adapter", async () => {
  const saved = [];
  configureExecutivePersistence({
    mode:"test",
    save:async session => saved.push(structuredClone(session)),
    loadActive:async()=>[], deleteExpired:async()=>0,
    health:async()=>({status:"ok",mode:"test"}), close:async()=>{}
  });
  const session = await createExecutiveSession();
  await updateOpportunity(session.id, { business_gap:"A measurable continuity gap" });
  assert.equal(saved.length, 2);
  assert.equal(saved.at(-1).opportunity.business_gap, "A measurable continuity gap");
});
