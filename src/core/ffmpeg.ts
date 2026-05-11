import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

export async function findFfmpeg() {
  const candidates = [
    process.env.FFMPEG_PATH,
    "ffmpeg",
    path.join(process.cwd(), "vendor", "ffmpeg", process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg"),
    path.join(process.cwd(), "tools", "ffmpeg", process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg")
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (candidate !== "ffmpeg") {
      try {
        await fs.access(candidate);
      } catch {
        continue;
      }
    }

    const ok = await probe(candidate);
    if (ok) return candidate;
  }

  return null;
}

function probe(command: string) {
  return new Promise<boolean>((resolve) => {
    const child = spawn(command, ["-version"], { stdio: "ignore" });
    child.on("error", () => resolve(false));
    child.on("exit", (code) => resolve(code === 0));
  });
}

export function mergeWithFfmpeg(ffmpeg: string, videoPath: string, audioPath: string, outputPath: string) {
  return new Promise<void>((resolve, reject) => {
    const args = [
      "-y",
      "-i",
      videoPath,
      "-i",
      audioPath,
      "-c",
      "copy",
      outputPath
    ];
    const child = spawn(ffmpeg, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || `ffmpeg exited with code ${code}`));
    });
  });
}
