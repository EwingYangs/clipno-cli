# clipno

Save any link to Notion, or extract any URL into structured data (title, author, tags, markdown) — from your terminal.

```bash
npm i -g clipno
# or, without installing:
npx clipno save <url>
```

## Quick start

```bash
clipno login              # opens a browser to authorize this machine
clipno save <url>         # save a link to your Notion database
```

## Commands

| Command | Description | Main flags |
| --- | --- | --- |
| `clipno login` | Authorize this machine via browser | `--token <token>` — paste a token instead of opening a browser |
| `clipno logout` | Delete the locally stored token | — |
| `clipno whoami` | Verify the stored token against the clipno API | — |
| `clipno save <url>` | Save a link to your Notion database | `--tags "a,b"`, `--note "..."`, `--title "..."`, `--json` (raw API response) |
| `clipno extract <url>` | Extract a URL into structured data (JSON by default) | `--markdown` (content markdown only) |

`clipno extract` runs specialized extractors for X/Twitter, WeChat, YouTube, Reddit, GitHub, and LinkedIn; other URLs go through a generic extraction pipeline. Output includes title, author, tags, publish date, content markdown, images, and video where available.

## Use it as a Claude Code skill

clipno ships a [skill](skills/clipno/SKILL.md) so Claude can save and extract links on your behalf. Install it any of these ways:

```bash
# 1. skills CLI
npx skills add EwingYangs/clipno-cli

# 2. Claude Code plugin marketplace
/plugin marketplace add EwingYangs/clipno-cli

# 3. Manual
cp -r skills/clipno ~/.claude/skills/
```

## Authentication

`clipno login` opens your browser to clipno.app to authorize the CLI, then stores a token locally (`~/.config/clipno/config.json`).

For headless environments (SSH, CI), create a personal access token at [clipno.app/dashboard/tokens](https://clipno.app/dashboard/tokens) and either:

```bash
clipno login --token <clipno_pat_...>
```

or set it as an environment variable, which takes precedence over the stored token:

```bash
export CLIPNO_TOKEN=<clipno_pat_...>
```

Tokens can be revoked at any time from the [dashboard](https://clipno.app/dashboard/tokens).

## Links

- [clipno.app](https://clipno.app)
- Free plan: 50 saves/month

## License

MIT
