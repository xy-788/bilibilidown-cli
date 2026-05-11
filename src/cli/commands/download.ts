import { download } from "../../core/downloader.ts";
import type { ArtifactKind } from "../../core/artifact.ts";

const ALLOWED = new Set(["video", "cover", "nfo", "subtitle", "danmaku"]);

export async function downloadCommand(input: string, outputDir: string, withValue = "video,cover,nfo", quality = "127") {
  const requested = withValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  for (const item of requested) {
    if (!ALLOWED.has(item)) {
      throw new Error(`Unknown artifact type: ${item}`);
    }
  }

  return download(input, outputDir, requested as ArtifactKind[], Number(quality));
}
