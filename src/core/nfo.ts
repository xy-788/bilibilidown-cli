import fs from "node:fs/promises";
import { artifactPaths } from "./artifact.ts";
import type { BiliInfo, BiliPage } from "../providers/bilibili/metadata.ts";

export async function writeNfo(info: BiliInfo, outputDir: string, page?: BiliPage, includePageInName = false) {
  await fs.mkdir(outputDir, { recursive: true });
  const paths = artifactPaths(outputDir, info.title, info.bvid, page, includePageInName);
  await fs.writeFile(paths.nfo, toNfo(info, page), "utf8");
  return paths.nfo;
}

function toNfo(info: BiliInfo, page?: BiliPage) {
  const title = page && info.pages.length > 1 ? `${info.title} - ${page.part || `P${page.page}`}` : info.title;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<movie>
  <title>${xml(title)}</title>
  <originaltitle>${xml(info.title)}</originaltitle>
  <plot>${xml(info.desc)}</plot>
  <runtime>${Math.round(info.duration / 60)}</runtime>
  <premiered>${formatDate(info.pubdate)}</premiered>
  <studio>Bilibili</studio>
  <id>${xml(info.bvid)}</id>
  <uniqueid type="bilibili" default="true">${xml(info.bvid)}</uniqueid>
  <thumb>${xml(info.pic)}</thumb>
  <actor>
    <name>${xml(info.owner?.name ?? "")}</name>
    <role>UP 主</role>
  </actor>
</movie>
`;
}

function xml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatDate(epochSeconds: number) {
  if (!epochSeconds) return "";
  return new Date(epochSeconds * 1000).toISOString().slice(0, 10);
}
