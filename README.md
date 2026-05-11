# bilibilidown-cli

Agent-friendly Bilibili media archival CLI. It is designed for Codex, Claude Code, Cursor, and other agents that need stable JSON output and verifiable artifacts.

The command name is `bdown`.

## Status

This project is in an early MVP stage. The current focus is a single-video workflow:

- environment check
- Bilibili QR login
- video metadata
- cover download
- NFO generation
- DASH video/audio download and ffmpeg merge
- stable JSON success/error output
- built-in agent Skill

Batch download, multi-part videos, collections, subtitle conversion, queueing, and resume support are planned for later milestones.

## Install

After the package is published to npm:

```bash
npm install -g bilibilidown-cli
bdown doctor --json
```

For local development:

```bash
npm install
npm run doctor
npm run bdown -- info BVxxxx --json
```

## Common Commands

```bash
bdown doctor --json
bdown auth status --json
bdown auth status --check --json
bdown auth login --json
bdown auth poll <qrcodeKey> --json
bdown info <url-or-bv> --json
bdown cover <url-or-bv> -o ./out --json
bdown nfo <url-or-bv> -o ./out --json
bdown download <url-or-bv> -o ./out --with video,cover,nfo --quality 127 --json
```

## Bilibili Login

The CLI has a built-in Bilibili QR login flow. It does not require users to copy cookies manually:

```bash
bdown auth login --json
bdown auth poll <qrcodeKey> --json
bdown auth status --check --json
```

After QR confirmation, the CLI stores the required cookie locally at `~/.bdown/cookie.txt`. Later `info`, `download`, and playurl requests will use it automatically for logged-in access and higher quality streams.

For non-interactive environments, use:

```bash
bdown auth set-cookie --from-env BILI_COOKIE --json
```

Do not paste cookie values into chat, issues, logs, or regular config files.

## ffmpeg

`bilibilidown-cli` does not depend on Bilidown GUI. Video merging only needs a normal `ffmpeg` installation. Lookup order:

1. `FFMPEG_PATH`
2. `ffmpeg` from system `PATH`
3. `vendor/ffmpeg/ffmpeg(.exe)` inside this project
4. `tools/ffmpeg/ffmpeg(.exe)` inside this project

The Docker image installs `ffmpeg`.

## JSON Contract

Successful artifact-producing commands return stable JSON:

```json
{
  "status": "ok",
  "provider": "bilibili",
  "bvid": "BVxxxx",
  "title": "Video title",
  "outputDir": "/absolute/output",
  "artifacts": {
    "video": "/absolute/output/video.mp4",
    "cover": "/absolute/output/cover.jpg",
    "nfo": "/absolute/output/video.nfo",
    "subtitle": null,
    "danmaku": null
  },
  "warnings": []
}
```

Errors are JSON too:

```json
{
  "status": "error",
  "code": "AUTH_REQUIRED",
  "message": "This video requires login or higher privileges.",
  "next": "Run bdown auth login --json."
}
```

## Development

```bash
npm install
npm test
npm run build
```

Before publishing:

```bash
npm pack --dry-run
npm publish
```

## License

MIT
