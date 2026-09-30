import test from "node:test";
import assert from "node:assert/strict";
import { BRIDGE1_PROMPT } from "../src/bridge1-prompt.js";

test("prompt preserves commercial authority boundaries", () => {
  for (const required of ["cannot issue or accept a binding offer", "Never promise or guarantee", "explicit permission", "six figures", "Audio recording is off by default"]) {
    assert.match(BRIDGE1_PROMPT, new RegExp(required, "i"));
  }
});

test("prompt labels all four company rooms as concepts", () => {
  for (const company of ["Amazon", "Target", "McDonald's", "Delta"]) assert.match(BRIDGE1_PROMPT, new RegExp(company));
  assert.match(BRIDGE1_PROMPT, /independent BOT FACTORY concept samplers/i);
});

test("prompt includes responsible holiday path", () => {
  assert.match(BRIDGE1_PROMPT, /bounded supervised seasonal pilot/i);
  assert.match(BRIDGE1_PROMPT, /urgency bypass governance/i);
});

test("prompt preserves Agent X and store identity separation", () => {
  assert.match(BRIDGE1_PROMPT, /Agent X is a separate professional AI workforce and agency company/i);
  assert.match(BRIDGE1_PROMPT, /Agent X is not BOT CORE/i);
  assert.match(BRIDGE1_PROMPT, /must not be described as the public umbrella over The Bot Stores/i);
  assert.match(BRIDGE1_PROMPT, /Executive Suite is a small premium side room/i);
});
