# bilibilidown-cli

`bilibilidown-cli` 是一个面向 AI agent 的 B 站下载与媒体归档 CLI。

它的命令名是 `bdown`。这个项目的核心目标不是做一个图形界面下载器，而是给 Codex、Claude Code、Cursor 这类 agent 一个稳定、可验证、可自动化调用的 B 站下载能力。

换句话说，它是一个新的 agent-first CLI + Skill 项目：人负责提出目标，agent 负责调用命令、检查结果、汇报产物。

## 它适合做什么

- 让 agent 根据 BV 号或 B 站视频链接读取视频信息
- 下载视频封面
- 生成媒体库常用的 `.nfo` 元数据文件
- 下载 B 站 DASH 音视频流并用 `ffmpeg` 合并
- 下载多 P 视频，可以选择单 P、全部分 P，或指定范围
- 下载弹幕 XML
- 下载 B 站字幕并转换成 SRT
- 读取文本文件里的多个 URL，做轻量批量下载
- 通过扫码登录 B 站账号，以便请求登录后可访问的更高画质
- 用稳定的 `--json` 输出告诉 agent：成功了什么、生成了哪些文件、失败时下一步该怎么办
- 随项目内置 `SKILL.md`，让 agent 安装后知道怎么安全地调用它

简单说：它是一个“给 agent 用的 B 站下载器”，不是一个临时下载脚本。

## 现在做到哪一步了

当前还处在早期 MVP 阶段，已经有一条单视频闭环：

- 环境检查：`bdown doctor`
- B 站扫码登录：`bdown auth login`
- 视频信息读取：`bdown info`
- 封面下载：`bdown cover`
- NFO 生成：`bdown nfo`
- 单视频下载：`bdown download`
- 多 P 选择：`--page all`、`--page 1,3-5`
- 字幕和弹幕：`--with subtitle,danmaku`
- 批量 URL：`bdown batch urls.txt`
- 内置 agent Skill：`skills/bilidown-cli/SKILL.md`

后续计划再补：

- 合集/收藏夹
- ASS 弹幕转换
- 断点续传
- 任务队列
- 更完整的媒体库目录结构

## 安装方式

发布到 npm 后，可以这样安装：

```bash
npm install -g bilibilidown-cli
```

安装后检查一下：

```bash
bdown doctor --json
```

当前如果是本地开发，可以在项目目录里运行：

```bash
npm install
npm run doctor
npm run bdown -- info BVxxxx --json
```

## 常用命令

查看环境：

```bash
bdown doctor --json
```

查看视频信息：

```bash
bdown info BVxxxx --json
```

下载封面和生成 NFO：

```bash
bdown cover BVxxxx -o ./out --json
bdown nfo BVxxxx -o ./out --json
```

下载单个视频：

```bash
bdown download BVxxxx -o ./out --with video,cover,nfo --quality 127 --json
```

下载全部分 P：

```bash
bdown download BVxxxx -o ./out --with video,cover,nfo,subtitle,danmaku --page all --quality 127 --json
```

只下载指定分 P：

```bash
bdown download BVxxxx -o ./out --with cover,nfo,danmaku --page 1,3-5 --json
```

批量下载文本文件里的多个链接：

```bash
bdown batch urls.txt -o ./out --with video,cover,nfo --page 1 --json
```

`urls.txt` 一行一个 BV 号或 B 站链接，空行和 `#` 开头的注释行会被跳过。

## 登录 B 站账号

如果视频需要登录，或者你想请求更高画质，可以用扫码登录：

```bash
bdown auth login --json
```

命令会返回一个 `loginUrl` 和 `qrcodeKey`。用浏览器打开 `loginUrl`，或用 B 站 App 扫码确认后，再运行：

```bash
bdown auth poll <qrcodeKey> --json
```

登录成功后，必要的 cookie 会保存在本机：

```text
~/.bdown/cookie.txt
```

之后 `info`、`download`、播放流请求会自动使用这个登录态。

这个项目不会自动读取浏览器 cookie，也不建议把 cookie 粘贴到聊天、Issue、日志或普通配置文件里。

## CLI 退出码

- `0`：命令成功；扫码登录的 `pending`（等待扫码、等待确认等）也保持为 `0`。
- `1`：命令抛出异常、返回 `status: "error"`，或返回 `status: "partial"` 且 `failed > 0`。

退出码规则不依赖 `--json`。批量任务部分失败时仍会完整输出结果，agent 可以读取 `succeeded`、`failed` 和 `results` 判断哪些项目需要重试。

## 关于 ffmpeg

下载视频时，B 站通常返回分离的音频流和视频流，所以需要通用的 `ffmpeg` 来合并。工具会按下面顺序查找：

1. `FFMPEG_PATH`
2. 系统 `PATH` 里的 `ffmpeg`
3. 项目内的 `vendor/ffmpeg/ffmpeg(.exe)`
4. 项目内的 `tools/ffmpeg/ffmpeg(.exe)`

Docker 镜像会内置 `ffmpeg`。

## 给 agent 的说明在哪里

README 主要给人看，解释这个项目是什么、怎么开始用。

真正给 agent 用的操作协议放在这里：

```text
skills/bilidown-cli/SKILL.md
skills/bilidown-cli/references/
```

里面会说明：

- 什么时候触发这个工具
- 为什么先跑 `doctor`
- 为什么下载前先跑 `info`
- 下载后怎么汇报 artifact 清单
- 多 P 下载时怎么读取 `pages` 产物清单
- 遇到 `AUTH_REQUIRED` 怎么处理
- 为什么不能自动读取浏览器 cookie

## 开发与发布

本地测试：

```bash
npm test
```

构建 CLI：

```bash
npm run build
```

检查 npm 发布包内容：

```bash
npm pack --dry-run
```

正式发布：

```bash
npm publish
```

## 项目定位

这个项目的长期目标是做成一个正式的、面向 agent 生态的 B 站下载工具：

```text
CLI 负责稳定执行，
Skill 负责告诉 agent 怎么调用，
JSON 输出负责让结果可验证。
```

先把“agent 可用、输出稳定、产物可验证”做好，再逐步补齐更完整的下载器体验。

## License

MIT
