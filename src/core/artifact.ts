import path from "node:path";
import { artifactBaseName } from "./naming.ts";

export type ArtifactKind = "video" | "cover" | "nfo" | "subtitle" | "danmaku";

export type ArtifactMap = Record<ArtifactKind, string | null>;

export function emptyArtifacts(): ArtifactMap {
  return {
    video: null,
    cover: null,
    nfo: null,
    subtitle: null,
    danmaku: null
  };
}

export function artifactPaths(outputDir: string, title: string, bvid: string, page?: { page: number; part?: string }, includePageInName = false) {
  const absoluteOutputDir = path.resolve(outputDir);
  const pageLabel = includePageInName && page
    ? ` P${String(page.page).padStart(2, "0")}${page.part ? ` ${page.part}` : ""}`
    : "";
  const base = artifactBaseName(`${title}${pageLabel}`, bvid);
  return {
    video: path.join(absoluteOutputDir, `${base}.mp4`),
    cover: path.join(absoluteOutputDir, `${base}.jpg`),
    nfo: path.join(absoluteOutputDir, `${base}.nfo`),
    subtitle: path.join(absoluteOutputDir, `${base}.srt`),
    danmaku: path.join(absoluteOutputDir, `${base}.xml`)
  };
}
