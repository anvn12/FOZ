---
name: ai-usage-log
description: Automatically logs AI-assisted code changes to ai-logs/<username>.md at the repository root. Each team member gets their own log file named after their GitHub login. Activates after any response where source code files were modified. Use in every coding session.
---

# AI Usage Log

## Instructions

After each response where you modified source code files (e.g. `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.html`, `.css`, `.scss`, `.go`, `.rs`, `.java`, `.c`, `.cpp`, `.h`, `.php`, `.rb`, `.sql`), append an entry to the team log file.

### Determine the log location (do this every time)

1. **Find the repo root** — run `git rev-parse --show-toplevel`. This is the `<repo-root>`. ALWAYS use this, never the current working directory, so logs land in one place regardless of which subfolder you are working in.
2. **Find the user's GitHub name** — run `gh api user --jq .login` to get the GitHub login. If `gh` is unavailable or unauthenticated, fall back to `git config user.name` and sanitize it: lowercase, replace spaces with hyphens (e.g. `Shiki Rei` → `shiki-rei`).
3. **The log file is always** `<repo-root>/ai-logs/<username>.md`. Create the `ai-logs/` directory at the repo root if it does not exist.

### What to skip
- Read-only sessions (no file modifications at all)
- `.md` files in `docs/`, `ai-logs/`, or `ideas/`
- Non-code files (images, videos, lockfiles, `.env`, etc.)
- Changes that are only to `README.md` or documentation

### Log entry format

1. Read `<repo-root>/ai-logs/<username>.md` if it exists. If not, start with an empty string.
2. Append the following entry (use the current local time, 24-hour format `YYYY-MM-DD HH:MM`):

```markdown

### YYYY-MM-DD HH:MM
**Tool:** <current agent name, e.g. pi, copilot, claude-code, etc.>
**Model:** <current agent model, e.g. kimi 2.6, gpt-5 mini, etc.>
**Prompt:** "<the user's exact message from this turn>"
**Files touched:** `<file1>`, `<file2>`, ...
```

3. Write the full updated content back to `<repo-root>/ai-logs/<username>.md`.

### Notes
- Only log the **current turn's prompt** — not the full conversation history.
- List every file path that was created or modified in this turn.
- Use paths relative to the repo root.
- Do not log this skill's own logging activity (do not include the log file itself in the files touched list).
- If the agent cannot determine a username (no git repo, no gh, no git config), skip logging rather than guessing.
