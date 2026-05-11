import fs from "node:fs/promises";
import { artifactPaths } from "./artifact.ts";
import type { BiliInfo } from "../providers/bilibili/metadata.ts";

export async function writeNfo(info: BiliInfo, outputDir: string) {
  await fs.mkdir(outputDir, { recursive: true });
  const paths = artifactPaths(outputDir, info.title, info.bvid);
  await fs.writeFile(paths.nfo, toNfo(info), "utf8");
  return paths.nfo;
}

function toNfo(info: BiliInfo) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<movie>
  <title>${xml(info.title)}</title>
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
