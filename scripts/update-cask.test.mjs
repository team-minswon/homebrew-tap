import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { assetsFor, checksumsFor, verify, render } from "./update-cask.mjs";
const version = "0.1.0-beta.1";
const release = { draft: false, published_at: "fixture", tag_name: `desktop-v${version}`, assets: [`HeyMoa-${version}-mac-arm64.zip`, `HeyMoa-${version}-mac-x64.zip`, "SHA256SUMS"].map((name) => ({ name, size: 10, browser_download_url: `https://github.com/team-minswon/homebrew-tap/releases/download/desktop-v${version}/${name}` })) };
test("only published matching releases with both real architecture URLs are eligible", () => {
  assert.equal(assetsFor(release, version).length, 3);
  assert.throws(() => assetsFor({ ...release, draft: true }, version), /published/);
  assert.throws(() => assetsFor({ ...release, assets: release.assets.slice(1) }, version), /Missing/);
  assert.throws(() => assetsFor({ ...release, assets: release.assets.map((asset) => ({ ...asset, browser_download_url: "fixture-other-repository" })) }, version), /invalid/);
  assert.throws(() => assetsFor(release, "invalid"), /Invalid/);
});
test("streaming bytes require the published size and exact checksum", async () => {
  const data = Buffer.from("installer fixture");
  const digest = createHash("sha256").update(data).digest("hex");
  const asset = { name: "fixture.zip", size: data.length };
  async function* chunks(value) { yield value.subarray(0, 4); yield value.subarray(4); }
  assert.equal(await verify(asset, chunks(data), digest), digest);
  await assert.rejects(verify(asset, chunks(Buffer.alloc(data.length)), digest), /mismatch/);
  await assert.rejects(verify(asset, chunks(data.subarray(0, 4)), digest), /mismatch/);
  await assert.rejects(verify(asset, chunks(Buffer.concat([data, data])), digest), /exceeds/);
  assert.throws(() => checksumsFor("invalid"), /Malformed/);
});
test("one cask token preserves architecture checksums and exact minor-version guard without OS bypass", () => {
  const cask = render(version, "a".repeat(64), "b".repeat(64));
  assert.match(cask, /cask "heymoa"/);
  assert.match(cask, /MacOS.full_version < MacOSVersion.new\("14.2"\)/);
  assert.match(cask, /without Developer ID/);
  assert.doesNotMatch(cask, /no_check|xattr|spctl|--no-quarantine/);
  assert.throws(() => render(version, "unknown", "b".repeat(64)), /Invalid/);
});
