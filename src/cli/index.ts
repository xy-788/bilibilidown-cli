#!/usr/bin/env node
import { parseArgs, flagValue, hasJson } from "./args.ts";
import { printJson, printTextLines } from "../core/json-output.ts";
import { toErrorPayload } from "../core/errors.ts";
import { doctorCommand } from "./commands/doctor.ts";
import { infoCommand } from "./commands/info.ts";
import { coverCommand } from "./commands/cover.ts";
import { nfoCommand } from "./commands/nfo.ts";
import { downloadCommand } from "./commands/download.ts";
import { authCommand } from "./commands/auth.ts";
import { batchCommand } from "./commands/batch.ts";
import type { ArtifactKind } from "../core/artifact.ts";

async function main() {
  const args = parseArgs();
  const json = hasJson(args.flags);

  try {
    const result = await dispatch(args);
    if (json || typeof result !== "string") printJson(result);
    else printTextLines([result]);
  } catch (error) {
    const payload = toErrorPayload(error);
    printJson(payload);
    process.exitCode = 1;
  }
}

async function dispatch(args: ReturnType<typeof parseArgs>) {
  const out = flagValue(args.flags, ["o", "output"], ".");
  const withValue = flagValue(args.flags, ["with"], "video,cover,nfo");
  const quality = flagValue(args.flags, ["quality", "qn"], "127");
  const page = flagValue(args.flags, ["page", "p"], "1");
  const subtitleLang = flagValue(args.flags, ["subtitle-lang"], undefined);

  if (args.command === "doctor") return doctorCommand();
  if (args.command === "auth") return authCommand(process.argv.slice(3));
  if (args.command === "info") return infoCommand(requireInput(args.positionals[0]));
  if (args.command === "cover") return coverCommand(requireInput(args.positionals[0]), out);
  if (args.command === "nfo") return nfoCommand(requireInput(args.positionals[0]), out);
  if (args.command === "download") return downloadCommand(requireInput(args.positionals[0]), out, withValue, quality, page, args.flags.has("all-pages"), subtitleLang);
  if (args.command === "batch") return batchCommand(requireInput(args.positionals[0]), out, parseWith(withValue), {
    quality: Number(quality),
    pageSelector: page,
    allPages: args.flags.has("all-pages"),
    subtitleLang
  });
  if (args.command === "help" || args.command === "--help" || args.command === "-h") return helpText();

  return {
    status: "error",
    code: "UNKNOWN_COMMAND",
    message: `Unknown command: ${args.command}`,
    next: "Run bdown help."
  };
}

function requireInput(input?: string) {
  if (!input) {
    throw new Error("Missing <url-or-bv> input.");
  }
  return input;
}

function helpText() {
  return [
    "bilibilidown-cli",
    "",
    "Commands:",
    "  bdown doctor [--json]",
    "  bdown auth status [--json]",
    "  bdown auth status --check [--json]",
    "  bdown auth login [--json]",
    "  bdown auth poll <qrcodeKey> [--json]",
    "  bdown auth set-cookie --from-env BILI_COOKIE [--json]",
    "  bdown auth clear [--json]",
    "  bdown info <url-or-bv> [--json]",
    "  bdown cover <url-or-bv> -o <dir> [--json]",
    "  bdown nfo <url-or-bv> -o <dir> [--json]",
    "  bdown download <url-or-bv> -o <dir> --with video,cover,nfo,subtitle,danmaku --page all --quality 127 [--json]",
    "  bdown batch urls.txt -o <dir> --with video,cover,nfo --page 1 [--json]"
  ].join("\n");
}

main();

function parseWith(withValue: string): ArtifactKind[] {
  const allowed = new Set(["video", "cover", "nfo", "subtitle", "danmaku"]);
  const requested = withValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  for (const item of requested) {
    if (!allowed.has(item)) {
      throw new Error(`Unknown artifact type: ${item}`);
    }
  }
  return requested as ArtifactKind[];
}
