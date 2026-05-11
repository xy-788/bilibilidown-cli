import { biliGetJson } from "./api.ts";
import { parseBilibiliInput } from "./parse-url.ts";

export type BiliPage = {
  cid: number;
  page: number;
  part: string;
  duration: number;
};

export type BiliInfo = {
  bvid: string;
  aid: number;
  cid: number;
  title: string;
  desc: string;
  pic: string;
  owner: {
    mid: number;
    name: string;
  };
  pages: BiliPage[];
  duration: number;
  pubdate: number;
};

export async function getVideoInfo(input: string): Promise<BiliInfo> {
  const { bvid } = parseBilibiliInput(input);
  const qs = new URLSearchParams({ bvid });
  const data = await biliGetJson<any>(`https://api.bilibili.com/x/web-interface/view?${qs}`);
  const first = data.pages?.[0];

  return {
    bvid: data.bvid,
    aid: data.aid,
    cid: first?.cid ?? data.cid,
    title: data.title,
    desc: data.desc ?? "",
    pic: data.pic,
    owner: data.owner,
    pages: data.pages ?? [],
    duration: data.duration ?? 0,
    pubdate: data.pubdate ?? 0
  };
}
