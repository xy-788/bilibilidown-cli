import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const CONFIG_DIR = path.join(os.homedir(), ".bdown");
const COOKIE_FILE = path.join(CONFIG_DIR, "cookie.txt");

export async function getStoredCookie() {
  try {
    const cookie = (await fs.readFile(COOKIE_FILE, "utf8")).trim();
    return cookie.length > 0 ? cookie : null;
  } catch {
    return null;
  }
}

export async function setStoredCookie(cookie: string) {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.writeFile(COOKIE_FILE, cookie.trim(), { mode: 0o600 });
}

export async function clearStoredCookie() {
  try {
    await fs.rm(COOKIE_FILE);
  } catch {
    // Already clear.
  }
}
