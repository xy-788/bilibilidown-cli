import fs from "node:fs/promises";
import { artifactPaths } from "./artifact.ts";
import { downloadUrlToFile } from "../providers/bilibili/api.ts";
import type { BiliInfo } from "../providers/bilibili/metadata.ts";

export async function writeCover(info: BiliInfo, outputDir: string) {
  await fs.mkdir(outputDir, { recursive: true });
  const paths = artifactPaths(outputDir, info.title, info.bvid);
  await downloadUrlToFile(info.pic, paths.cover);
  return paths.cover;
}
