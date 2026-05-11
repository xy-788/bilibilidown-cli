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

export function artifactPaths(outputDir: string, title: string, bvid: string) {
  const absoluteOutputDir = path.resolve(outputDir);
  const base = artifactBaseName(title, bvid);
  return {
    video: path.join(absoluteOutputDir, `${base}.mp4`),
    cover: path.join(absoluteOutputDir, `${base}.jpg`),
    nfo: path.join(absoluteOutputDir, `${base}.nfo`),
    subtitle: path.join(absoluteOutputDir, `${base}.srt`),
    danmaku: path.join(absoluteOutputDir, `${base}.xml`)
  };
}
