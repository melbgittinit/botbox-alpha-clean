import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const blueprint = await readFile(new URL("../render.yaml", import.meta.url), "utf8");

test("deployment blueprint keeps BRIDGE-1 voice paused by default", () => {
  assert.match(blueprint, /name:\s*bridge1-executive-suite/i);
  assert.match(blueprint, /key:\s*BRIDGE1_ACTIVE\s*\n\s*value:\s*false/i);
  assert.match(blueprint, /key:\s*INVITE_REQUIRED\s*\n\s*value:\s*true/i);
});
