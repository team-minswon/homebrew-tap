cask "heymoa" do
  arch arm: "arm64", intel: "x64"

  version "0.1.0-beta.1"
  sha256 arm:   "c6914fc97e1910a19e278c5255cefbf7a21d0fccb4bcdf3380a03c415174bd27",
         intel: "5def0591d9f44dc26841b3dad125f1b7bfd64dcbf91bbfe80a0440e27848cf7d"

  url "https://github.com/team-minswon/homebrew-tap/releases/download/desktop-v#{version}/HeyMoa-#{version}-mac-#{arch}.zip",
      verified: "github.com/team-minswon/homebrew-tap/"
  name "HeyMoa"
  desc "Meeting audio recording"
  homepage "https://heymoa.app"

  depends_on macos: :sonoma

  app "HeyMoa.app"

  preflight do
    if MacOS.full_version < MacOSVersion.new("14.2")
      raise "HeyMoa requires macOS 14.2 or later for system audio capture."
    end
  end

  caveats <<~EOS
    This is an unsigned beta without Developer ID signing or Apple notarization.
    Homebrew installation does not bypass Gatekeeper. If macOS blocks the app,
    use the app-specific Privacy & Security approval after verifying its source.
    Approve microphone during first-run setup or when starting a recording.
    System audio permission is checked when recording begins.
    Finish recording before upgrading. Automatic updates are not configured.
  EOS
end
