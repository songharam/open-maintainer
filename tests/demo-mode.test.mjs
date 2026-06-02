import test from "node:test";
import assert from "node:assert/strict";

import {
  DATA_MODES,
  modeButtonLabel,
  resolveInitialDataMode
} from "../src/demo-mode.js";

test("resolveInitialDataMode defaults to live GitHub mode", () => {
  assert.equal(resolveInitialDataMode(""), DATA_MODES.live);
  assert.equal(resolveInitialDataMode("?demo=unknown"), DATA_MODES.live);
});

test("resolveInitialDataMode accepts sample demo query parameters", () => {
  assert.equal(resolveInitialDataMode("?demo=sample"), DATA_MODES.sample);
  assert.equal(resolveInitialDataMode("?mode=sample"), DATA_MODES.sample);
  assert.equal(resolveInitialDataMode(new URLSearchParams("demo=sample")), DATA_MODES.sample);
});

test("modeButtonLabel returns user-facing labels", () => {
  assert.equal(modeButtonLabel(DATA_MODES.live), "Live GitHub");
  assert.equal(modeButtonLabel(DATA_MODES.sample), "Sample demo");
});
