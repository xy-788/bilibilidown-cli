import test from "node:test";
import assert from "node:assert/strict";
import { artifactBaseName, sanitizeFileName } from "../../src/core/naming.ts";

test("sanitizes Windows-unsafe filename chars", () => {
  assert.equal(sanitizeFileName('a<b>c:d"e/f\\g|h?i*j'), "a_b_c_d_e_f_g_h_i_j");
});

test("builds deterministic artifact base name", () => {
  assert.equal(artifactBaseName("测试视频", "BV1xx411c7mD"), "测试视频 [BV1xx411c7mD]");
});
