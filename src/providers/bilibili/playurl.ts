import { BdownError } from "../../core/errors.ts";
import { biliGetJson } from "./api.ts";

export type DashStream = {
  id: number;
  baseUrl: string;
  bandwidth: number;
  codecs: string;
  quality: number;
};

export type PlayUrl = {
  video: DashStream;
  audio: DashStream;
};

export async function getPlayUrl(bvid: string, cid: number, quality = 127): Promise<PlayUrl> {
  const qs = new URLSearchParams({
    bvid,
    cid: String(cid),
    qn: String(quality),
    fnval: "4048",
    fourk: "1"
  });
  const data = await biliGetJson<any>(`https://api.bilibili.com/x/player/playurl?${qs}`);
  const videos = data.dash?.video ?? [];
  const audios = data.dash?.audio ?? [];

  if (!videos.length || !audios.length) {
    throw new BdownError("NO_PLAYABLE_STREAM", "No DASH video/audio stream was returned.", "This may require login, a lower quality, or a different video.");
  }

  return {
    video: pickBest(videos),
    audio: pickBest(audios)
  };
}

function pickBest(streams: any[]): DashStream {
  const sorted = [...streams].sort((a, b) => (b.bandwidth ?? 0) - (a.bandwidth ?? 0));
  const selected = sorted[0];
  return {
    id: selected.id,
    baseUrl: selected.baseUrl ?? selected.base_url,
    bandwidth: selected.bandwidth ?? 0,
    codecs: selected.codecs ?? "",
    quality: selected.id ?? 0
  };
}
