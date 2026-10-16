cask "heymoa" do
  arch arm: "arm64", intel: "x64"

  version "0.1.2"
  sha256 arm:   "dcb2a9aa43962979b5fcaf1557a7f98c10370c6a2829e965a8dadcd9201b594c",
         intel: "d50f824f91cdf769a7724d19f7777d561a5dcc39180244e036b0de8741f06fae"

  url "https://github.com/team-minswon/homebrew-tap/releases/download/desktop-v#{version}/HeyMoa-#{version}-mac-#{arch}.zip"
  name "HeyMoa"
  desc "Meeting audio recording"
  homepage "https://heymoa.app/"

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
