import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../../", import.meta.url));
const mockFetch = fileURLToPath(new URL("./mock-fetch.mjs", import.meta.url));
const temp = await fs.mkdtemp(path.join(os.tmpdir(), "bdown-cli-tests-"));
let passed = 0;

try {
  const bundled = path.join(temp, "bdown.mjs");
  await build({ entryPoints: [path.join(root, "src/cli/index.ts")], bundle: true, platform: "node", format: "esm", outfile: bundled });
  const invalid = path.join(temp, "invalid.txt");
  const mixed = path.join(temp, "mixed.txt");
  const valid = path.join(temp, "valid.txt");
  await fs.writeFile(invalid, "not-a-bv\n");
  await fs.writeFile(mixed, "BV1xx411c7mD\nnot-a-bv\n");
  await fs.writeFile(valid, "BV1xx411c7mD\n");

  for (const entry of [path.join(root, "src/cli/index.ts"), bundled]) {
    const run = (args, expectedExit, expected) => {
      const child = spawnSync(process.execPath, ["--import", mockFetch, entry, ...args], {
        cwd: temp, encoding: "utf8", timeout: 10000,
        env: { ...process.env, BDOWN_TEST_MISSING_COOKIE: "" }
      });
      assert.ifError(child.error);
      assert.equal(child.signal, null);
      const result = JSON.parse(child.stdout);
      for (const [key, value] of Object.entries(expected)) assert.deepEqual(result[key], value);
      assert.equal(child.status, expectedExit, `${args.join(" ")}: ${child.stdout}\n${child.stderr}`);
      passed += 1;
      console.log(`ok - ${path.basename(entry)} ${args.join(" ")}`);
      return result;
    };

    const failed = run(["batch", invalid, "--json"], 1, { status: "partial", failed: 1, succeeded: 0, total: 1 });
    assert.equal(failed.results[0].code, "INVALID_INPUT");
    const batchArgs = ["--with", "nfo", "-o", path.join(temp, "out"), "--json"];
    const partial = run(["batch", mixed, ...batchArgs], 1, { status: "partial", failed: 1, succeeded: 1, total: 2 });
    assert.equal(partial.results[0].status, "ok");
    assert.equal(partial.results[1].code, "INVALID_INPUT");
    run(["batch", valid, ...batchArgs], 0, { status: "ok", failed: 0, succeeded: 1, total: 1 });
    run(["unknown", "--json"], 1, { status: "error", code: "UNKNOWN_COMMAND" });
    run(["unknown"], 1, { status: "error", code: "UNKNOWN_COMMAND" });
    run(["auth", "poll"], 1, { status: "error", code: "MISSING_QRCODE_KEY" });
    run(["auth", "set-cookie", "--json"], 1, { status: "error", code: "INVALID_AUTH_COMMAND" });
    run(["auth", "set-cookie", "--from-env", "BDOWN_TEST_MISSING_COOKIE", "--json"], 1, { status: "error", code: "COOKIE_ENV_NOT_FOUND" });
    run(["auth", "unknown", "--json"], 1, { status: "error", code: "UNKNOWN_AUTH_COMMAND" });
    run(["info", "not-a-bv", "--json"], 1, { status: "error", code: "INVALID_INPUT" });
    run(["help", "--json"], 0, {});
    const help = spawnSync(process.execPath, [entry, "help"], { cwd: temp, encoding: "utf8", timeout: 10000 });
    assert.ifError(help.error);
    assert.equal(help.status, 0);
    assert.match(help.stdout, /^bilibilidown-cli\n/);
    passed += 1;
    run(["auth", "status", "--json"], 0, { status: "ok" });
    run(["auth", "login", "--json"], 0, { status: "pending", login: "waiting_scan" });
    for (const [code, login] of [[86101, "waiting_scan"], [86090, "waiting_confirm"], [86038, "expired"]]) {
      run(["auth", "poll", String(code), "--json"], 0, { status: "pending", login, code });
    }
  }
  console.log(`${passed} CLI exit-code checks passed`);
} finally {
  await fs.rm(temp, { recursive: true, force: true });
}
