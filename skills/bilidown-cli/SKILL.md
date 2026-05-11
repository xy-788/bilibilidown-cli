---
name: bilidown-cli
description: Use bilidown-cli/bdown to archive Bilibili videos with stable JSON output and verifiable artifacts such as video, cover, NFO, subtitles, and danmaku. Trigger when the user asks to download or archive Bilibili media, generate Bilidown-style metadata, or turn a BV/video URL into local media files.
---

# bilidown-cli

Use this skill for agent-run Bilibili archival workflows.

## Operating Protocol

1. Run `bdown doctor --json` first when the environment is unknown.
2. Run `bdown info <url-or-bv> --json` before downloading, and confirm the title, uploader, `bvid`, and page count.
3. Choose an explicit output directory before creating files.
4. If login is needed for higher quality, run `bdown auth login --json`, have the user scan or open `loginUrl`, then poll with `bdown auth poll <qrcodeKey> --json`.
5. Download with a clear artifact list:

```powershell
bdown download <url-or-bv> -o <output-dir> --with video,cover,nfo --quality 127 --json
```

6. Report the artifact paths returned by JSON. Do not infer success from chat text alone.

## Common Commands

```powershell
bdown doctor --json
bdown auth status --json
bdown auth status --check --json
bdown auth login --json
bdown auth poll <qrcodeKey> --json
bdown info <BV-or-url> --json
bdown cover <BV-or-url> -o <output-dir> --json
bdown nfo <BV-or-url> -o <output-dir> --json
bdown download <BV-or-url> -o <output-dir> --with video,cover,nfo --quality 127 --json
```

## Cookie Safety

Do not inspect browser cookie stores automatically.

If a command returns `AUTH_REQUIRED`, ask the user how they want to provide login state. Prefer the built-in QR login flow:

```powershell
bdown auth login --json
bdown auth poll <qrcodeKey> --json
```

For non-interactive environments, use `BILI_COOKIE` in the current process environment:

```powershell
bdown auth set-cookie --from-env BILI_COOKIE --json
```

Never ask the user to paste a cookie into chat, and never echo cookie values in logs or final answers.

## References

- `references/artifact-contract.md`
- `references/cookie-safety.md`
- `references/agent-workflow.md`
