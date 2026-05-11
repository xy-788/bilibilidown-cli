import path from "node:path";
import { writeCover } from "../../core/cover.ts";
import { getVideoInfo } from "../../providers/bilibili/metadata.ts";

export async function coverCommand(input: string, outputDir: string) {
  const info = await getVideoInfo(input);
  const cover = await writeCover(info, outputDir);
  return {
    status: "ok",
    provider: "bilibili",
    bvid: info.bvid,
    title: info.title,
    outputDir: path.resolve(outputDir),
    artifacts: { cover },
    warnings: []
  };
}
