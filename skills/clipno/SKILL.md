---
name: clipno
description: Save any link to Notion, or extract any URL into structured data (title, author, tags, markdown), via the clipno CLI. Use when the user wants to save, clip, or bookmark a link to Notion, or parse or extract a URL's content. Trigger phrases include save to notion, clip this link, save this link, 存到 Notion, 剪藏这个链接, 保存到 Notion, 解析这个链接.
---

# clipno — Save links to Notion, extract URLs as data

## Prerequisites

Run commands with the `clipno` CLI. If it is not installed, use `npx -y clipno@latest` as a drop-in replacement for `clipno`.

If any command fails with an authentication error (exit code 1, message mentions `clipno login`), STOP and tell the user to run `clipno login` in their terminal (it opens a browser). Do not attempt to log in for them. Headless alternative: create a token at https://clipno.app/dashboard/tokens and run `clipno login --token <token>`.

## Save a link to Notion

```bash
clipno save <url> --json
```

Optional flags: `--tags "a,b"`, `--note "..."`, `--title "..."`.
Parse the JSON output and give the user the `pageUrl` (their new Notion page) and `title`. On quota errors, relay the API message (free plan: 50 saves/month).

## Extract a URL as structured data

```bash
clipno extract <url>            # full JSON: title, author, tags, markdown, images, video
clipno extract <url> --markdown # content markdown only
```

Use extract when the user wants the content itself (to summarize, translate, analyze, or transform) rather than to store it. The JSON fields: title, author, image, favicon, publishedDate, tags[], source, resourceType, sourceIcon, contentMarkdown, postImages[], video.

## Notes

- Both commands accept any http(s) URL. Specialized extractors exist for X/Twitter, WeChat, YouTube, Reddit, GitHub, LinkedIn; other sites go through a generic pipeline.
- `clipno whoami` verifies credentials. `clipno logout` removes them.
