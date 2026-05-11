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

For multi-part downloads, `artifacts` is `null` at the top level and each selected page has its own artifact map:

```json
{
  "status": "ok",
  "pageSelector": "all",
  "totalPages": 3,
  "selectedPages": 3,
  "artifacts": null,
  "pages": [
    {
      "page": 1,
      "cid": 123,
      "part": "P1 title",
      "artifacts": {
        "video": "/out/title P01 P1 title.mp4",
        "cover": "/out/title P01 P1 title.jpg",
        "nfo": "/out/title P01 P1 title.nfo",
        "subtitle": "/out/title P01 P1 title.srt",
        "danmaku": "/out/title P01 P1 title.xml"
      },
      "warnings": []
    }
  ]
}
```
