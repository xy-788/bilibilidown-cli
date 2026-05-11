# Agent Workflow

1. Run `bdown doctor --json`.
2. Run `bdown info <url-or-bv> --json`.
3. Confirm the intended output directory.
4. If login is needed for higher quality, run `bdown auth login --json`, have the user scan or open `loginUrl`, then poll with `bdown auth poll <qrcodeKey> --json`.
5. Run `bdown download <url-or-bv> -o <dir> --with video,cover,nfo --quality 127 --json`.
6. Verify that the returned artifact files exist if the environment allows filesystem checks.
7. Summarize:
   - title
   - bvid
   - output directory
   - artifact paths
   - warnings

For metadata-only work, use `bdown cover` and `bdown nfo` instead of a full download.
