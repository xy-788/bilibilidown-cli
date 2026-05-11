# Artifact Contract

Every successful artifact-producing command should return JSON with:

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

Failures should return:

```json
{
  "status": "error",
  "code": "AUTH_REQUIRED",
  "message": "This video requires login or higher privileges.",
  "next": "Set BILI_COOKIE or lower quality."
}
```

Agents should report returned paths, not guessed paths.
