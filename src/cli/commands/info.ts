import { getVideoInfo } from "../../providers/bilibili/metadata.ts";

export async function infoCommand(input: string) {
  const info = await getVideoInfo(input);
  return {
    status: "ok",
    provider: "bilibili",
    bvid: info.bvid,
    aid: info.aid,
    cid: info.cid,
    title: info.title,
    uploader: info.owner?.name ?? null,
    cover: info.pic,
    duration: info.duration,
    pages: info.pages.map((page) => ({
      cid: page.cid,
      page: page.page,
      title: page.part,
      duration: page.duration
    })),
    warnings: []
  };
}
