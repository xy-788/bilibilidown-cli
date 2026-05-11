import path from "node:path";
import { writeNfo } from "../../core/nfo.ts";
import { getVideoInfo } from "../../providers/bilibili/metadata.ts";

export async function nfoCommand(input: string, outputDir: string) {
  const info = await getVideoInfo(input);
  const nfo = await writeNfo(info, outputDir);
  return {
    status: "ok",
    provider: "bilibili",
    bvid: info.bvid,
    title: info.title,
    outputDir: path.resolve(outputDir),
    artifacts: { nfo },
    warnings: []
  };
}
