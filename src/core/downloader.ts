import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { artifactPaths, emptyArtifacts, type ArtifactKind } from "./artifact.ts";
import { BdownError } from "./errors.ts";
import { findFfmpeg, mergeWithFfmpeg } from "./ffmpeg.ts";
import { writeCover } from "./cover.ts";
import { writeNfo } from "./nfo.ts";
import { selectPages } from "./page-selection.ts";
import { downloadUrlToFile } from "../providers/bilibili/api.ts";
import { downloadDanmaku } from "../providers/bilibili/danmaku.ts";
import { getVideoInfo } from "../providers/bilibili/metadata.ts";
import { getPlayUrl } from "../providers/bilibili/playurl.ts";
import { downloadSubtitle } from "../providers/bilibili/subtitle.ts";

export type DownloadOptions = {
  quality?: number;
  pageSelector?: string;
  allPages?: boolean;
  subtitleLang?: string;
};

export async function download(input: string, outputDir: string, requested: ArtifactKind[], options: DownloadOptions = {}) {
  const info = await getVideoInfo(input);
  await fs.mkdir(outputDir, { recursive: true });
  const selectedPages = selectPages(info.pages, options.pageSelector ?? "1", options.allPages);
  const includePageInName = info.pages.length > 1;
  const warnings: string[] = [];
  const ffmpeg = requested.includes("video") ? await findFfmpeg() : null;

  if (requested.includes("video") && !ffmpeg) {
    throw new BdownError("FFMPEG_NOT_FOUND", "ffmpeg was not found.", "Install ffmpeg, set FFMPEG_PATH, use Docker, or place ffmpeg under vendor/ffmpeg.");
  }

  const pageResults = [];
  for (const page of selectedPages) {
    const paths = artifactPaths(outputDir, info.title, info.bvid, page, includePageInName);
    const artifacts = emptyArtifacts();
    const pageWarnings: string[] = [];
    let selectedStreams = null;

    if (requested.includes("cover")) {
      artifacts.cover = await writeCover(info, outputDir, page, includePageInName);
    }

    if (requested.includes("nfo")) {
      artifacts.nfo = await writeNfo(info, outputDir, page, includePageInName);
    }

    if (requested.includes("danmaku")) {
      await downloadDanmaku(page.cid, paths.danmaku);
      artifacts.danmaku = paths.danmaku;
    }

    if (requested.includes("subtitle")) {
      const subtitle = await downloadSubtitle(info.bvid, page.cid, paths.subtitle, options.subtitleLang);
      if (subtitle) artifacts.subtitle = subtitle.path;
      else pageWarnings.push("No subtitle is available for this page.");
    }

    if (requested.includes("video")) {
      const playUrl = await getPlayUrl(info.bvid, page.cid, options.quality ?? 127);
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "bdown-"));
      const videoPart = path.join(tmpDir, "video.m4s");
      const audioPart = path.join(tmpDir, "audio.m4s");

      try {
        await downloadUrlToFile(playUrl.video.baseUrl, videoPart);
        await downloadUrlToFile(playUrl.audio.baseUrl, audioPart);
        await mergeWithFfmpeg(ffmpeg as string, videoPart, audioPart, paths.video);
        artifacts.video = paths.video;
        selectedStreams = {
          requestedQuality: options.quality ?? 127,
          videoQuality: playUrl.video.quality,
          videoBandwidth: playUrl.video.bandwidth,
          videoCodecs: playUrl.video.codecs,
          audioBandwidth: playUrl.audio.bandwidth,
          audioCodecs: playUrl.audio.codecs
        };
      } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    }

    pageResults.push({
      page: page.page,
      cid: page.cid,
      part: page.part,
      duration: page.duration,
      artifacts,
      selectedStreams,
      warnings: pageWarnings
    });
    warnings.push(...pageWarnings.map((item) => `P${page.page}: ${item}`));
  }

  return {
    status: "ok",
    provider: "bilibili",
    bvid: info.bvid,
    title: info.title,
    outputDir: path.resolve(outputDir),
    pageSelector: options.allPages ? "all" : options.pageSelector ?? "1",
    totalPages: info.pages.length,
    selectedPages: pageResults.length,
    artifacts: pageResults.length === 1 ? pageResults[0].artifacts : null,
    pages: pageResults,
    warnings
  };
}
