---
name: ai-usage-log
description: Automatically logs AI-assisted code and specification changes to ai-logs/<username>.md at the repository root. Each team member gets their own log file named after their GitHub login. Activates after any response where source code or SpecKit files were modified. Use in every coding session.
---

# AI Usage Log

## When to log (MANDATORY — no exceptions)

After each response where you modified source code files (e.g. `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.html`, `.css`, `.scss`, `.go`, `.rs`, `.java`, `.c`, `.cpp`, `.h`, `.php`, `.rb`, `.sql`, `.json`) OR SpecKit design & specification files (e.g. `specs/*`, `spec.md`, `plan.md`, `tasks.md`, `research.md`, `data-model.md`, `checklists/*`, `contracts/*`), append an entry to the team log file.

- Source code (`.ts`, `.js`, `.py`, `.go`, `.rs`, `.sql`, `.html`, `.css`, etc.)
- Documentation (`.md`, `.txt`, `.rst`, `.adoc`)
- Configuration (`.yml`, `.yaml`, `.json`, `.toml`, `.ini`, `.env.example`)
- Specs and plans (`spec.md`, `plan.md`, `tasks.md`, `constitution.md`)
- Shell scripts (`.sh`, `.bat`, `.ps1`)
- Any other file in the repository

**Do NOT log only when:** the response was purely conversational with
zero file operations (no create, edit, write, or delete). If in doubt,
log.

### What to log
- Any turn that creates or modifies source code files (`src/`, `lib/`, `tests/`, etc.)
- Any turn that creates or modifies SpecKit workflow files and feature specs (`specs/*`, `spec.md`, `plan.md`, `tasks.md`, `research.md`, `data-model.md`, `checklists/*`, `contracts/*`)
- Any prompt/reply turn during `/speckit.specify`, `/speckit.clarify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.implement`, etc.

### What to skip
- Read-only sessions (no file modifications at all, e.g. `/speckit.analyze` read-only reports)
- `.md` files in `docs/`, `ai-logs/`, or `ideas/` (unless part of a turn modifying code/specs)
- Changes that are strictly limited to `README.md`

1. **Find the repo root** — run `git rev-parse --show-toplevel`. This is
   the `<repo-root>`. ALWAYS use this, never the current working
   directory, so logs land in one place regardless of which subfolder you
   are working in.
2. **Find the user's GitHub name** — run `gh api user --jq .login` to get
   the GitHub login. If `gh` is unavailable or unauthenticated, fall back
   to `git config user.name` and sanitize it: lowercase, replace spaces
   with hyphens (e.g. `Shiki Rei` → `shiki-rei`).
3. **The log file is always** `<repo-root>/ai-logs/<username>.md`. Create
   the `ai-logs/` directory at the repo root if it does not exist.

## Log entry format

1. Read `<repo-root>/ai-logs/<username>.md` if it exists. If not, start
   with an empty string.
2. Append the following entry to the very **end (bottom)** of the document
   (chronological order, NEVER prepend to the top) using the current local time,
   24-hour format `YYYY-MM-DD HH:MM`:

```markdown

### YYYY-MM-DD HH:MM
**Tool:** <current agent name, e.g. pi, copilot, claude-code, etc.>
**Model:** <current agent model, e.g. kimi 2.6, gpt-5 mini, etc.>
**Prompt:** "<the user's exact message from this turn>"
**Files touched:** `<file1>`, `<file2>`, ...
```

3. Write the full updated content back to
   `<repo-root>/ai-logs/<username>.md`.

## Rules

- **Placement:** Always append new entries to the **end (bottom)** of the document. NEVER prepend at the top.
- **Prompt field is mandatory.** Always record the user's exact input that
  triggered the file changes, even if it was a single word or a follow-up.
- Only log the **current turn's prompt** — not the full conversation
  history.
- List every file path that was created, modified, or deleted in this
  turn.
- Use paths relative to the repo root.
- Do not log this skill's own logging activity (do not include the log file itself in the files touched list).
- If the agent cannot determine a username (no git repo, no gh, no git config), skip logging rather than guessing.

