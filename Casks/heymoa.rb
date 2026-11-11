cask "heymoa" do
  version "0.1.4"
  sha256 "b2b93a0ea739bd06d80af1d61cf55cb5ce18aab1a7f47f4603e608d80c5d1592"

  url "https://github.com/team-minswon/homebrew-tap/releases/download/desktop-v#{version}/HeyMoa-#{version}-mac-arm64.zip"
  name "HeyMoa"
  desc "Meeting audio recording"
  homepage "https://heymoa.app/"

  depends_on arch: :arm64
  depends_on macos: :sonoma

  app "HeyMoa.app"

  preflight_steps do
    run "/bin/sh", args: ["-c", "version=$(/usr/bin/sw_vers -productVersion) || exit 1\nmajor=${version%%.*}\nminor=${version#*.}\nminor=${minor%%.*}\nif [ \"$major\" -ge 14 ] && { [ \"$major\" -gt 14 ] || [ \"$minor\" -ge 2 ]; }; then\n  exit 0\nfi\nprintf '%s\n' 'HeyMoa requires macOS 14.2 or later for system audio capture.' >&2\nexit 1"]
  end

  caveats <<~EOS
    HeyMoa is signed with a Developer ID certificate and notarized by Apple.
    Approve microphone during first-run setup or when starting a recording.
    System audio permission is checked when recording begins.
    Finish recording before upgrading. In-app updates are available in Settings > App updates.
    Automatic updates are off by default and can be enabled there.
  EOS
end
