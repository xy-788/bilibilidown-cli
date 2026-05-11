import fs from "node:fs/promises";
import { artifactPaths } from "./artifact.ts";
import { downloadUrlToFile } from "../providers/bilibili/api.ts";
import type { BiliInfo, BiliPage } from "../providers/bilibili/metadata.ts";

export async function writeCover(info: BiliInfo, outputDir: string, page?: BiliPage, includePageInName = false) {
  await fs.mkdir(outputDir, { recursive: true });
  const paths = artifactPaths(outputDir, info.title, info.bvid, page, includePageInName);
  await downloadUrlToFile(info.pic, paths.cover);
  return paths.cover;
}
