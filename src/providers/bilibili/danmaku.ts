import { downloadUrlToFile } from "./api.ts";

export async function downloadDanmaku(cid: number, target: string) {
  await downloadUrlToFile(`https://api.bilibili.com/x/v1/dm/list.so?oid=${cid}`, target);
}
