import { BdownError } from "../core/errors.ts";
import { setStoredCookie } from "./cookie.ts";

const LOGIN_GENERATE_URL = "https://passport.bilibili.com/x/passport-login/web/qrcode/generate";
const LOGIN_POLL_URL = "https://passport.bilibili.com/x/passport-login/web/qrcode/poll";
const NAV_URL = "https://api.bilibili.com/x/web-interface/nav";

type ApiPayload<T> = {
  code: number;
  message?: string;
  data: T;
};

type QrGenerateData = {
  url: string;
  qrcode_key: string;
};

type QrPollData = {
  code: number;
  message: string;
  url?: string;
};

export async function createQrLogin() {
  const payload = await fetchJson<ApiPayload<QrGenerateData>>(LOGIN_GENERATE_URL);
  if (payload.code !== 0) {
    throw new BdownError("LOGIN_QR_CREATE_FAILED", payload.message || "Failed to create Bilibili login QR code.", "Retry later.");
  }

  return {
    loginUrl: payload.data.url,
    qrcodeKey: payload.data.qrcode_key
  };
}

export async function pollQrLogin(qrcodeKey: string) {
  const url = `${LOGIN_POLL_URL}?${new URLSearchParams({ qrcode_key: qrcodeKey })}`;
  const res = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 bilidown-cli/0.1",
      "referer": "https://www.bilibili.com/"
    }
  });
  const payload = await res.json() as ApiPayload<QrPollData>;

  if (payload.code !== 0) {
    throw new BdownError("LOGIN_POLL_FAILED", payload.message || "Failed to poll Bilibili login status.", "Retry later.");
  }

  if (payload.data.code === 0) {
    const cookie = extractCookie(res);
    if (!cookie) {
      throw new BdownError("LOGIN_COOKIE_MISSING", "Login succeeded but no cookie was returned.", "Retry login or use BILI_COOKIE.");
    }
    await setStoredCookie(cookie);
    return {
      status: "ok",
      login: "confirmed",
      storedCookie: true,
      warnings: []
    };
  }

  const states: Record<number, string> = {
    86101: "waiting_scan",
    86090: "waiting_confirm",
    86038: "expired"
  };

  return {
    status: "pending",
    login: states[payload.data.code] ?? "unknown",
    code: payload.data.code,
    message: payload.data.message,
    storedCookie: false,
    warnings: payload.data.code === 86038 ? ["QR login expired. Run bdown auth login --json again."] : []
  };
}

export async function checkLogin(cookie: string) {
  const payload = await fetchJson<ApiPayload<any>>(NAV_URL, {
    headers: {
      "user-agent": "Mozilla/5.0 bilidown-cli/0.1",
      "referer": "https://www.bilibili.com/",
      cookie
    }
  });

  return {
    isLogin: Boolean(payload.data?.isLogin),
    uname: payload.data?.uname ?? null,
    mid: payload.data?.mid ?? null,
    vipStatus: payload.data?.vipStatus ?? null,
    vipType: payload.data?.vipType ?? null
  };
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 bilidown-cli/0.1",
      "referer": "https://www.bilibili.com/"
    },
    ...init
  });
  if (!res.ok) {
    throw new BdownError("HTTP_ERROR", `Bilibili login API returned HTTP ${res.status}.`, "Check network access and retry.");
  }
  return await res.json() as T;
}

function extractCookie(res: Response) {
  const headers = res.headers as Headers & { getSetCookie?: () => string[] };
  const setCookie = headers.getSetCookie?.() ?? [];
  const fallback = headers.get("set-cookie");
  const parts = (setCookie.length ? setCookie : fallback ? splitSetCookie(fallback) : [])
    .map((item) => item.split(";", 1)[0])
    .filter(Boolean);
  return parts.length ? parts.join("; ") : null;
}

function splitSetCookie(value: string) {
  return value.split(/,(?=\s*[^;,\s]+=)/g).map((item) => item.trim());
}
