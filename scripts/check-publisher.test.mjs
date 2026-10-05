import { test } from "node:test";
import assert from "node:assert/strict";
import { requirePublisher } from "./check-publisher.mjs";
test("only the explicitly authorized browser identity passes policy", () => {
  assert.doesNotThrow(() => requirePublisher("minswon-official", "browser"));
  for (const login of ["alstn113", "minswon", "", "unknown"]) assert.throws(() => requirePublisher(login, "browser"), /Release blocked/);
  assert.throws(() => requirePublisher("minswon-official", "cli"), /Release blocked/);
});
