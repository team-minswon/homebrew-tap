import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
export function requirePublisher(login, channel) {
  if (login !== "minswon-official" || channel !== "browser") throw new Error("Release blocked: only the verified minswon-official browser session is authorized. CLI publication, account switching, and fallback are forbidden.");
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  throw new Error("Release blocked: this CLI cannot verify a browser session or publish. Use the user-authorized browser only after final QA and a release alert.");
}
