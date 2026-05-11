import { BdownError } from "../../core/errors.ts";
import { getStoredCookie } from "../../auth/cookie.ts";
import { getCookieFromEnv } from "../../auth/env.ts";

const UA = "Mozilla/5.0 bilidown-cli/0.1";

export async function biliGetJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: await biliHeaders()
  });

  if (!res.ok) {
    throw new BdownError("HTTP_ERROR", `Bilibili API returned HTTP ${res.status}.`, "Check network access and retry.");
  }

  const payload = await res.json() as { code?: number; message?: string; data?: T };
  if (payload.code && payload.code !== 0) {
    const authCodes = new Set([-101, -10403, -404]);
    throw new BdownError(
      authCodes.has(payload.code) ? "AUTH_REQUIRED" : "BILIBILI_API_ERROR",
      payload.message || `Bilibili API error ${payload.code}.`,
      authCodes.has(payload.code) ? "Set BILI_COOKIE or use bdown auth set-cookie --from-env BILI_COOKIE." : "Inspect the input URL and retry."
    );
  }

  return payload.data as T;
}

export async function biliHeaders(extra: Record<string, string> = {}) {
  const cookie = getCookieFromEnv() ?? await getStoredCookie();
  return {
    "user-agent": UA,
    "referer": "https://www.bilibili.com/",
    ...(cookie ? { cookie } : {}),
    ...extra
  };
}

export async function downloadUrlToFile(url: string, target: string) {
  const { createWriteStream } = await import("node:fs");
  const { pipeline } = await import("node:stream/promises");
  const { Readable } = await import("node:stream");

  const res = await fetch(url, { headers: await biliHeaders() });
  if (!res.ok || !res.body) {
    throw new BdownError("DOWNLOAD_FAILED", `Download returned HTTP ${res.status}.`, "Retry later or provide BILI_COOKIE if the resource is restricted.");
  }

  await pipeline(Readable.fromWeb(res.body), createWriteStream(target));
}
