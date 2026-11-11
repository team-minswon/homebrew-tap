cask "heymoa" do
  version "0.1.7"
  sha256 "cb5dd33739ed0706fedfc0d11f8db5e0f24dd5d4c470cf44765a325588c05f78"

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
    Finish recording and audio uploads before upgrading.
    Open Settings from the menu bar popup for opacity and app updates.
    Automatic updates default to on for new or unset installations; explicit opt-out is preserved.
  EOS
end
