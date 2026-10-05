import { createHash } from "node:crypto";
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repository = "team-minswon/homebrew-tap";
export function assetsFor(release, version) {
  if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)) throw new Error("Invalid version");
  if (release.draft || !release.published_at || release.tag_name !== `desktop-v${version}`) throw new Error("A published matching desktop release is required");
  const prefix = `https://github.com/${repository}/releases/download/desktop-v${version}/`;
  return [`HeyMoa-${version}-mac-arm64.zip`, `HeyMoa-${version}-mac-x64.zip`, "SHA256SUMS"].map((name) => {
    const matching = release.assets.filter((asset) => asset.name === name);
    if (matching.length !== 1 || matching[0].size <= 0 || matching[0].browser_download_url !== prefix + name) throw new Error(`Missing or invalid asset: ${name}`);
    return matching[0];
  });
}
export function checksumsFor(text) {
  const checksums = new Map();
  for (const line of text.trim().split(/\r?\n/)) {
    const match = /^([a-f0-9]{64})  (HeyMoa-[\w.-]+\.(?:dmg|zip|exe))$/.exec(line);
    if (!match || checksums.has(match[2])) throw new Error("Malformed or duplicate checksum");
    checksums.set(match[2], match[1]);
  }
  return checksums;
}
export async function verify(asset, body, expected) {
  const hash = createHash("sha256");
  let size = 0;
  for await (const chunk of body) {
    size += chunk.length;
    if (size > asset.size) throw new Error(`Download exceeds published size: ${asset.name}`);
    hash.update(chunk);
  }
  const digest = hash.digest("hex");
  if (size !== asset.size || digest !== expected) throw new Error(`Download size/checksum mismatch: ${asset.name}`);
  return digest;
}
export function render(version, arm, intel) {
  if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version) || ![arm, intel].every((value) => /^[a-f0-9]{64}$/.test(value))) throw new Error("Invalid cask input");
  return `cask "heymoa" do\n  arch arm: "arm64", intel: "x64"\n\n  version "${version}"\n  sha256 arm:   "${arm}",\n         intel: "${intel}"\n\n  url "https://github.com/${repository}/releases/download/desktop-v#{version}/HeyMoa-#{version}-mac-#{arch}.zip",\n      verified: "github.com/${repository}/"\n  name "HeyMoa"\n  desc "Meeting audio recording"\n  homepage "https://heymoa.app"\n\n  depends_on macos: :sonoma\n\n  app "HeyMoa.app"\n\n  preflight do\n    if MacOS.full_version < MacOSVersion.new("14.2")\n      raise "HeyMoa requires macOS 14.2 or later for system audio capture."\n    end\n  end\n\n  caveats <<~EOS\n    This is an unsigned beta without Developer ID signing or Apple notarization.\n    Homebrew installation does not bypass Gatekeeper. If macOS blocks the app,\n    use the app-specific Privacy & Security approval after verifying its source.\n    Approve microphone and system audio only when starting a recording.\n    Finish recording before upgrading. Automatic updates are not configured.\n  EOS\nend\n`;
}
async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`Published download unavailable: HTTP ${response.status}`);
  return response;
}
async function update() {
  const version = process.argv[2];
  if (!version || process.argv.length !== 3 || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)) throw new Error("Usage: node scripts/update-cask.mjs VERSION");
  const release = await (await get(`https://api.github.com/repos/${repository}/releases/tags/desktop-v${version}`)).json();
  const [arm, intel, sums] = assetsFor(release, version);
  const checksums = checksumsFor(await (await get(sums.browser_download_url)).text());
  const armHash = await verify(arm, (await get(arm.browser_download_url)).body, checksums.get(arm.name));
  const intelHash = await verify(intel, (await get(intel.browser_download_url)).body, checksums.get(intel.name));
  const casks = fileURLToPath(new URL("../Casks/", import.meta.url));
  mkdirSync(casks, { recursive: true });
  writeFileSync(resolve(casks, "heymoa.rb.tmp"), render(version, armHash, intelHash));
  renameSync(resolve(casks, "heymoa.rb.tmp"), resolve(casks, "heymoa.rb"));
  console.log(`Verified published ${release.tag_name}; Casks/heymoa.rb updated locally, nothing pushed`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await update();
