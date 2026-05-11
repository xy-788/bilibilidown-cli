const ILLEGAL_FILE_CHARS = /[<>:"/\\|?*\u0000-\u001F]/g;

export function sanitizeFileName(value: string, fallback = "untitled") {
  const cleaned = value.replace(ILLEGAL_FILE_CHARS, "_").replace(/\s+/g, " ").trim();
  return cleaned.length > 0 ? cleaned.slice(0, 160) : fallback;
}

export function artifactBaseName(title: string, bvid: string) {
  return `${sanitizeFileName(title)} [${bvid}]`;
}
