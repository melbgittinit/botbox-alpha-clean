import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../public/media.html", import.meta.url), "utf8");

test("media experience states the pilot status and human authority boundary", () => {
  assert.match(html, /CONCEPT \/ PILOT/i);
  assert.match(html, /authorized human/i);
  assert.match(html, /cannot finalize price, contract terms or guarantees/i);
});

test("media experience labels scripted material and controls live access", () => {
  assert.match(html, /SCRIPTED MEDIA PREVIEW/i);
  assert.match(html, /not a live agent session/i);
  assert.match(html, /valid invitation is required/i);
  assert.match(html, /supervised, invitation-based previews/i);
});

test("media experience includes accessibility and non-affiliation essentials", () => {
  assert.match(html, /Skip to media briefing/i);
  assert.match(html, /role="tablist"/i);
  assert.match(html, /do not imply a customer relationship, partnership, endorsement, deployment or participation/i);
});

test("media experience shows the brief output and governed access request", () => {
  assert.match(html, /See what crosses the human desk/i);
  assert.match(html, /Illustrative brief · not a proposal/i);
  assert.match(html, /id="mediaRequestForm"/i);
  assert.match(html, /expires after 90 days/i);
  assert.match(html, /No voice-room invitation is issued automatically/i);
});
