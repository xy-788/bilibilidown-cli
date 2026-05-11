import { BdownError } from "../../core/errors.ts";

const BVID_RE = /BV[0-9A-Za-z]{10}/;

export function parseBilibiliInput(input: string) {
  const direct = input.match(BVID_RE)?.[0];
  if (direct) return { bvid: direct };

  try {
    const url = new URL(input);
    const match = `${url.pathname}${url.search}`.match(BVID_RE)?.[0];
    if (match) return { bvid: match };
  } catch {
    // Not a URL.
  }

  throw new BdownError("INVALID_INPUT", "Expected a Bilibili BV id or video URL.", "Pass a value such as BV1xx411c7mD or https://www.bilibili.com/video/BV...");
}
