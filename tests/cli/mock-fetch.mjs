// Keep CLI regression tests offline and independent of real login credentials.
globalThis.fetch = async (input) => {
  const url = new URL(String(input));
  if (url.origin === "https://api.bilibili.com" && url.pathname === "/x/web-interface/view") {
    return Response.json({
      code: 0,
      data: {
        bvid: url.searchParams.get("bvid"), aid: 1, title: "CLI fixture", desc: "",
        pic: "", owner: { mid: 1, name: "fixture" }, duration: 60, pubdate: 0,
        pages: [{ cid: 1, page: 1, part: "fixture", duration: 60 }]
      }
    });
  }
  if (url.origin === "https://passport.bilibili.com") {
    if (url.pathname === "/x/passport-login/web/qrcode/generate") {
      return Response.json({ code: 0, data: { url: "https://example.invalid/qr", qrcode_key: "fixture" } });
    }
    if (url.pathname === "/x/passport-login/web/qrcode/poll") {
      return Response.json({ code: 0, data: { code: Number(url.searchParams.get("qrcode_key")), message: "fixture" } });
    }
  }
  throw new Error(`Unexpected network request in CLI test: ${url}`);
};
