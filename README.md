# bilidown-cli

面向 AI agent 的 B 站媒体归档 CLI。MVP 目标是稳定生成可验证产物：视频、封面、NFO、弹幕，并为关键命令提供 `--json` 输出。

## Quick Start

```powershell
npm run doctor
npm run bdown -- info BVxxxx --json
npm run bdown -- auth login --json
npm run bdown -- auth poll <qrcodeKey> --json
npm run bdown -- download BVxxxx -o ./out --with video,cover,nfo --quality 127 --json
```

安装为全局命令后可直接使用：

```powershell
bdown doctor --json
bdown info BVxxxx --json
bdown auth login --json
bdown auth poll <qrcodeKey> --json
bdown download BVxxxx -o ./out --with video,cover,nfo --quality 127 --json
```

## Commands

- `bdown doctor --json`
- `bdown auth status --json`
- `bdown auth status --check --json`
- `bdown auth login --json`
- `bdown auth poll <qrcodeKey> --json`
- `bdown auth set-cookie --from-env BILI_COOKIE --json`
- `bdown auth clear --json`
- `bdown info <url-or-bv> --json`
- `bdown cover <url-or-bv> -o ./out --json`
- `bdown nfo <url-or-bv> -o ./out --json`
- `bdown download <url-or-bv> -o ./out --with video,cover,nfo --quality 127 --json`

## Bilibili Login

CLI 内置 B 站网页扫码登录，不要求用户手工复制 cookie：

```powershell
bdown auth login --json
bdown auth poll <qrcodeKey> --json
bdown auth status --check --json
```

扫码确认后，CLI 会把必要 cookie 存到本机 `~/.bdown/cookie.txt`，后续 `info` / `download` / 播放流请求会自动带上它，用于获取登录后可访问的更高画质。非交互环境也可以继续使用：

```powershell
bdown auth set-cookie --from-env BILI_COOKIE --json
```

不要把 cookie 粘贴到聊天记录、issue、日志或普通配置文件里。

## ffmpeg

`bilidown-cli` 不依赖 Bilidown GUI。视频下载合并只需要通用 `ffmpeg`，查找顺序为：

1. `FFMPEG_PATH`
2. 系统 `PATH` 中的 `ffmpeg`
3. 项目内 `vendor/ffmpeg/ffmpeg(.exe)`
4. 项目内 `tools/ffmpeg/ffmpeg(.exe)`

Docker 镜像会安装 `ffmpeg`。

## MVP Scope

当前骨架聚焦单视频闭环：

- 环境检查
- B 站扫码登录与本机 cookie 存储
- 视频信息读取
- 封面下载
- NFO 生成
- DASH 音视频下载与 ffmpeg 合并
- 稳定 JSON 成功/失败输出
- 内置 Codex Skill

批量、多 P、合集、字幕转换、队列和断点续传放在后续里程碑。
