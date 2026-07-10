---
name: ai-usage-log
description: Automatically logs AI-assisted code changes made by the pi agent to ai-logs/shiki.md. Activates after any turn where write or edit tool calls modify source code files. Use in every coding session.
---

# AI Usage Log

## Instructions

After completing any tool calls in a turn that involve `write` or `edit` modifying source code files (e.g. `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.html`, `.css`, `.scss`, `.go`, `.rs`, `.java`, `.c`, `.cpp`, `.h`, `.php`, `.rb`, `.sql`), append an entry to `ai-logs/shiki.md` in the current working directory.

### What to skip
- Read-only sessions (no write/edit calls at all)
- `.md` files in `docs/`, `ai-logs/`, or `ideas/`
- Non-code files (images, videos, lockfiles, `.env`, etc.)
- Changes that are only to `README.md` or documentation

### Log entry format

1. Read `ai-logs/shiki.md` if it exists. If not, start with an empty string.
2. Append the following entry (use the current local time, 24-hour format `YYYY-MM-DD HH:MM`):

```markdown

### YYYY-MM-DD HH:MM
**Tool:** pi
**Prompt:** "<the user's exact message from this turn>"
**Files touched:** `<file1>`, `<file2>`, ...
```

3. Write the full updated content back to `ai-logs/shiki.md`.

### Notes
- Only log the **current turn's prompt** — not the full conversation history.
- List every file path that was created or modified by `write` or `edit` in this turn.
- Use relative paths from the project root.
- Do not log this skill's own logging activity (do not include `ai-logs/shiki.md` in the files touched list).
