import { findFfmpeg } from "../../core/ffmpeg.ts";
import { getStoredCookie } from "../../auth/cookie.ts";
import { getCookieFromEnv } from "../../auth/env.ts";

export async function doctorCommand() {
  const ffmpeg = await findFfmpeg();
  const envCookie = getCookieFromEnv();
  const storedCookie = await getStoredCookie();

  return {
    status: "ok",
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    ffmpeg: ffmpeg ? { status: "ok", path: ffmpeg } : { status: "missing", path: null },
    auth: {
      envCookie: Boolean(envCookie),
      storedCookie: Boolean(storedCookie)
    },
    warnings: ffmpeg ? [] : ["ffmpeg is required for video/audio merging. Install ffmpeg, set FFMPEG_PATH, use Docker, or place ffmpeg under vendor/ffmpeg."]
  };
}
