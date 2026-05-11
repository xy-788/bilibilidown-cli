import assert from "node:assert/strict";
import { parseBilibiliInput } from "../../src/providers/bilibili/parse-url.ts";
import { artifactBaseName, sanitizeFileName } from "../../src/core/naming.ts";

const cases = [];

function test(name, fn) {
  cases.push([name, fn]);
}

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
