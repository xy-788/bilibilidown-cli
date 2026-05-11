import test from "node:test";
import assert from "node:assert/strict";
import { parseBilibiliInput } from "../../src/providers/bilibili/parse-url.ts";

test("parses direct BV id", () => {
  assert.deepEqual(parseBilibiliInput("BV1xx411c7mD"), { bvid: "BV1xx411c7mD" });
});

test("parses BV id from URL", () => {
  assert.deepEqual(parseBilibiliInput("https://www.bilibili.com/video/BV1xx411c7mD/?p=1"), {
    bvid: "BV1xx411c7mD"
  });
});
