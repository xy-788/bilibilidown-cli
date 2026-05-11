export function getCookieFromEnv() {
  const cookie = process.env.BILI_COOKIE?.trim();
  return cookie && cookie.length > 0 ? cookie : null;
}
