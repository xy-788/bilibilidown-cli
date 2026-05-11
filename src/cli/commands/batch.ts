import fs from "node:fs/promises";
import path from "node:path";
import { download, type DownloadOptions } from "../../core/downloader.ts";
import type { ArtifactKind } from "../../core/artifact.ts";
import { toErrorPayload } from "../../core/errors.ts";

export async function batchCommand(filePath: string, outputDir: string, requested: ArtifactKind[], options: DownloadOptions = {}) {
  const content = await fs.readFile(filePath, "utf8");
  const inputs = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  const results = [];
  for (let index = 0; index < inputs.length; index += 1) {
    const input = inputs[index];
    const itemOutputDir = path.join(outputDir, String(index + 1).padStart(3, "0"));
    try {
      results.push(await download(input, itemOutputDir, requested, options));
    } catch (error) {
      results.push({
        input,
        outputDir: path.resolve(itemOutputDir),
        ...toErrorPayload(error)
      });
    }
  }

  const failed = results.filter((item: any) => item.status === "error").length;
  return {
    status: failed ? "partial" : "ok",
    inputFile: path.resolve(filePath),
    outputDir: path.resolve(outputDir),
    total: inputs.length,
    succeeded: inputs.length - failed,
    failed,
    results
  };
}
