import fs from "node:fs/promises";
import { biliGetJson, downloadUrlToFile } from "./api.ts";

type SubtitleInfo = {
  lan: string;
  lan_doc: string;
  subtitle_url: string;
};

type SubtitleLine = {
  from: number;
  to: number;
  content: string;
};

export async function listSubtitles(bvid: string, cid: number): Promise<SubtitleInfo[]> {
  const qs = new URLSearchParams({
    bvid,
    cid: String(cid)
  });
  const data = await biliGetJson<any>(`https://api.bilibili.com/x/player/v2?${qs}`);
  return data.subtitle?.subtitles ?? [];
}

export async function downloadSubtitle(bvid: string, cid: number, target: string, preferredLang = "zh-CN") {
  const subtitles = await listSubtitles(bvid, cid);
  if (!subtitles.length) return null;

  const selected = subtitles.find((item) => item.lan === preferredLang)
    ?? subtitles.find((item) => item.lan.startsWith("zh"))
    ?? subtitles[0];

  const url = normalizeSubtitleUrl(selected.subtitle_url);
  const rawTarget = target.replace(/\.srt$/i, ".subtitle.json");
  await downloadUrlToFile(url, rawTarget);

  const payload = JSON.parse(await fs.readFile(rawTarget, "utf8")) as { body?: SubtitleLine[] };
  const srt = toSrt(payload.body ?? []);
  await fs.writeFile(target, srt, "utf8");
  return {
    path: target,
    raw: rawTarget,
    language: selected.lan,
    languageName: selected.lan_doc
  };
}

function normalizeSubtitleUrl(value: string) {
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("http://")) return value.replace(/^http:\/\//, "https://");
  return value;
}

function toSrt(lines: SubtitleLine[]) {
  return lines.map((line, index) => [
    String(index + 1),
    `${formatTime(line.from)} --> ${formatTime(line.to)}`,
    line.content.trim(),
    ""
  ].join("\n")).join("\n");
}

function formatTime(seconds: number) {
  const ms = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const secs = Math.floor((ms % 60_000) / 1000);
  const millis = ms % 1000;
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${String(millis).padStart(3, "0")}`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
