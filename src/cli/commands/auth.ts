import { clearStoredCookie, getStoredCookie, setStoredCookie } from "../../auth/cookie.ts";
import { getCookieFromEnv } from "../../auth/env.ts";
import { checkLogin, createQrLogin, pollQrLogin } from "../../auth/bilibili-login.ts";

export async function authCommand(args: string[]) {
  const sub = args[0] ?? "status";
  const cookie = getCookieFromEnv() ?? await getStoredCookie();

  if (sub === "status") {
    const live = args.includes("--check") && cookie ? await checkLogin(cookie) : null;
    return {
      status: "ok",
      auth: {
        envCookie: Boolean(getCookieFromEnv()),
        storedCookie: Boolean(await getStoredCookie()),
        live
      },
      warnings: []
    };
  }

  if (sub === "login") {
    const qr = await createQrLogin();
    return {
      status: "pending",
      login: "waiting_scan",
      loginUrl: qr.loginUrl,
      qrcodeKey: qr.qrcodeKey,
      next: `Open loginUrl in a browser or scan it in Bilibili, then run: bdown auth poll ${qr.qrcodeKey} --json`,
      warnings: []
    };
  }

  if (sub === "poll") {
    const qrcodeKey = args[1];
    if (!qrcodeKey) {
      return {
        status: "error",
        code: "MISSING_QRCODE_KEY",
        message: "Missing qrcodeKey.",
        next: "Run bdown auth login --json first."
      };
    }
    return pollQrLogin(qrcodeKey);
  }

  if (sub === "set-cookie") {
    const fromEnvIndex = args.indexOf("--from-env");
    if (fromEnvIndex < 0 || !args[fromEnvIndex + 1]) {
      return {
        status: "error",
        code: "INVALID_AUTH_COMMAND",
        message: "Use bdown auth set-cookie --from-env BILI_COOKIE.",
        next: "Put the cookie in an environment variable first; do not paste it into chat."
      };
    }

    const envName = args[fromEnvIndex + 1];
    const cookie = process.env[envName]?.trim();
    if (!cookie) {
      return {
        status: "error",
        code: "COOKIE_ENV_NOT_FOUND",
        message: `Environment variable ${envName} is empty or missing.`,
        next: "Set the cookie in the current shell and retry."
      };
    }

    await setStoredCookie(cookie);
    return {
      status: "ok",
      storedCookie: true,
      warnings: []
    };
  }

  if (sub === "clear") {
    await clearStoredCookie();
    return {
      status: "ok",
      storedCookie: false,
      warnings: []
    };
  }

  return {
    status: "error",
    code: "UNKNOWN_AUTH_COMMAND",
    message: `Unknown auth command: ${sub}`,
    next: "Use bdown auth status, login, poll, set-cookie, or clear."
  };
}
