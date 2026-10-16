cask "heymoa" do
  arch arm: "arm64", intel: "x64"

  version "0.1.0"
  sha256 arm:   "e440fd897ad846faab1afaa8e41b3fcfea544325f6d0974d3e43a5f7cfa5e7bb",
         intel: "beabfc38c476956209bb411a9a8e1351751df322b188e063b2e6a35c9f4aa177"

  url "https://github.com/team-minswon/homebrew-tap/releases/download/desktop-v#{version}/HeyMoa-#{version}-mac-#{arch}.zip"
  name "HeyMoa"
  desc "Meeting audio recording"
  homepage "https://heymoa.app"

  depends_on macos: :sonoma

  app "HeyMoa.app"

  preflight_steps do
    run "/bin/sh", args: ["-c", "version=$(/usr/bin/sw_vers -productVersion) || exit 1\nmajor=${version%%.*}\nminor=${version#*.}\nminor=${minor%%.*}\nif [ \"$major\" -ge 14 ] && { [ \"$major\" -gt 14 ] || [ \"$minor\" -ge 2 ]; }; then\n  exit 0\nfi\nprintf '%s\n' 'HeyMoa requires macOS 14.2 or later for system audio capture.' >&2\nexit 1"]
  end

  caveats <<~EOS
    HeyMoa is signed with a Developer ID certificate and notarized by Apple.
    Approve microphone during first-run setup or when starting a recording.
    System audio permission is checked when recording begins.
    Finish recording before upgrading. Automatic updates are not configured.
  EOS
end
