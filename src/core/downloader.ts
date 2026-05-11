import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { artifactPaths, emptyArtifacts, type ArtifactKind } from "./artifact.ts";
import { BdownError } from "./errors.ts";
import { findFfmpeg, mergeWithFfmpeg } from "./ffmpeg.ts";
import { writeCover } from "./cover.ts";
import { writeNfo } from "./nfo.ts";
import { downloadUrlToFile } from "../providers/bilibili/api.ts";
import { downloadDanmaku } from "../providers/bilibili/danmaku.ts";
import { getVideoInfo } from "../providers/bilibili/metadata.ts";
import { getPlayUrl } from "../providers/bilibili/playurl.ts";
import { downloadSubtitle } from "../providers/bilibili/subtitle.ts";

export async function download(input: string, outputDir: string, requested: ArtifactKind[], quality = 127) {
  const info = await getVideoInfo(input);
  await fs.mkdir(outputDir, { recursive: true });
  const paths = artifactPaths(outputDir, info.title, info.bvid);
  const artifacts = emptyArtifacts();
  const warnings: string[] = [];
  let selectedStreams = null;

  if (requested.includes("cover")) {
    artifacts.cover = await writeCover(info, outputDir);
  }

  if (requested.includes("nfo")) {
    artifacts.nfo = await writeNfo(info, outputDir);
  }

  if (requested.includes("danmaku")) {
    await downloadDanmaku(info.cid, paths.danmaku);
    artifacts.danmaku = paths.danmaku;
  }

  if (requested.includes("subtitle")) {
    const subtitle = await downloadSubtitle();
    if (subtitle) artifacts.subtitle = subtitle;
    else warnings.push("Subtitle download is not implemented in this MVP.");
  }

  if (requested.includes("video")) {
    const ffmpeg = await findFfmpeg();
    if (!ffmpeg) {
      throw new BdownError("FFMPEG_NOT_FOUND", "ffmpeg was not found.", "Install ffmpeg, set FFMPEG_PATH, use Docker, or place ffmpeg under vendor/ffmpeg. Bilidown GUI is not required.");
    }

    const playUrl = await getPlayUrl(info.bvid, info.cid, quality);
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "bdown-"));
    const videoPart = path.join(tmpDir, "video.m4s");
    const audioPart = path.join(tmpDir, "audio.m4s");

    try {
      await downloadUrlToFile(playUrl.video.baseUrl, videoPart);
      await downloadUrlToFile(playUrl.audio.baseUrl, audioPart);
      await mergeWithFfmpeg(ffmpeg, videoPart, audioPart, paths.video);
      artifacts.video = paths.video;
      selectedStreams = {
        requestedQuality: quality,
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

  return {
    status: "ok",
    provider: "bilibili",
    bvid: info.bvid,
    title: info.title,
    outputDir: path.resolve(outputDir),
    artifacts,
    selectedStreams,
    warnings
  };
}
