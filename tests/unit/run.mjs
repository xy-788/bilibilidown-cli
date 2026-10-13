import assert from "node:assert/strict";
import { parseBilibiliInput } from "../../src/providers/bilibili/parse-url.ts";
import { artifactBaseName, sanitizeFileName } from "../../src/core/naming.ts";
import { selectPages } from "../../src/core/page-selection.ts";
import { resultExitCode } from "../../src/cli/exit-code.ts";

const cases = [];

function test(name, fn) {
  cases.push([name, fn]);
}

test("maps returned failures to nonzero exit codes", () => {
  assert.equal(resultExitCode({ status: "error" }), 1);
  assert.equal(resultExitCode({ status: "partial", failed: 1 }), 1);
  assert.equal(resultExitCode({ status: "partial", failed: 3 }), 1);
});

test("keeps success, login waiting, and results without failed items successful", () => {
  for (const result of [
    { status: "ok", warnings: ["optional artifact missing"] },
    { status: "pending", login: "waiting_scan" },
    { status: "pending", login: "waiting_confirm" },
    { status: "partial", failed: 0 },
    "help text", null, undefined
  ]) assert.equal(resultExitCode(result), 0);
});

test("parses direct BV id", () => {
  assert.deepEqual(parseBilibiliInput("BV1xx411c7mD"), { bvid: "BV1xx411c7mD" });
});

test("parses BV id from URL", () => {
  assert.deepEqual(parseBilibiliInput("https://www.bilibili.com/video/BV1xx411c7mD/?p=1"), {
    bvid: "BV1xx411c7mD"
  });
});

test("sanitizes Windows-unsafe filename chars", () => {
  assert.equal(sanitizeFileName('a<b>c:d"e/f\\g|h?i*j'), "a_b_c_d_e_f_g_h_i_j");
});

test("builds deterministic artifact base name", () => {
  assert.equal(artifactBaseName("测试视频", "BV1xx411c7mD"), "测试视频 [BV1xx411c7mD]");
});

const pages = [
  { cid: 1, page: 1, part: "one", duration: 10 },
  { cid: 2, page: 2, part: "two", duration: 20 },
  { cid: 3, page: 3, part: "three", duration: 30 }
];

test("selects all pages", () => {
  assert.deepEqual(selectPages(pages, "all").map((page) => page.page), [1, 2, 3]);
});

test("selects page ranges and explicit pages", () => {
  assert.deepEqual(selectPages(pages, "1,3-2").map((page) => page.page), [1, 2, 3]);
});

let passed = 0;
for (const [name, fn] of cases) {
  try {
    await fn();
    passed += 1;
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

console.log(`${passed}/${cases.length} tests passed`);
