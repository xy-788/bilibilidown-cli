# Cookie Safety

- Do not read browser cookie databases automatically.
- Do not paste cookie values into chat.
- Prefer `bdown auth login --json` and `bdown auth poll <qrcodeKey> --json` for normal interactive login.
- Prefer `BILI_COOKIE` for one-off non-interactive use.
- Use `bdown auth set-cookie --from-env BILI_COOKIE --json` only when the user explicitly wants a stored local cookie.
- Redact cookie values from logs and final reports.
- If authentication is required, explain the blocker without implying the CLI already has login access.
