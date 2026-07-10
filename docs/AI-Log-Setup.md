# AI Usage Log — Team Setup Guide

This project tracks AI-assisted code changes to maintain transparency across the team.

- **shiki** uses pi — auto-logs to `ai-logs/shiki.md`
- **Everyone else** uses Copilot Chat in VS Code — logs via git hooks to `ai-logs/<your-name>.md`

---

## One-Time Setup

Run this inside the repo:

```bash
git config core.hooksPath .githooks
```

This enables the commit-message hooks that handle logging.

---

## Daily Workflow (Copilot Chat Users)

### 1. Code with Copilot Chat/Edits as normal

### 2. Stage your files
Use VS Code's Source Control panel or terminal — staging works fine in GUI:

```bash
git add .
```

### 3. Commit from the terminal
Open VS Code's integrated terminal (`Ctrl+` `` ` ``) and run:

```bash
git commit
```

**Not** `git commit -m "..."`. Just `git commit` — this opens the commit editor.

### 4. Paste your Copilot prompt
The editor shows:

```
[AI-PROMPT] <paste your Copilot Chat prompt here, or DELETE THIS LINE if no AI was used>

# Please enter the commit message for your changes...
```

- **If you used Copilot:** paste your prompt after `[AI-PROMPT] `
- **If you didn't use Copilot:** delete the `[AI-PROMPT]` line entirely

Save and close the editor (Ctrl+S, close tab).

### 5. Done
The log entry is written automatically to `ai-logs/<your-git-username>.md`.

---

## What NOT to do

| Don't | Why |
|---|---|
| Click the ✓ button in VS Code's Source Control panel | Bypasses the hook — no log entry |
| Use `git commit -m "msg"` | Bypasses the hook — no log entry |
| Leave the placeholder text as-is | `post-commit` skips it — not logged |
| Delete the `[AI-PROMPT]` line when you DID use Copilot | Data loss — not logged |

---

## Log Format

Each entry looks like:

```markdown
### 2026-07-10 15:30
**Tool:** Copilot Chat
**Prompt:** "refactor auth middleware to use JWT"
**Files touched:** `src/backend/auth.js` `src/backend/middleware.js`
```

One file per person. No merge conflicts. Review your own usage anytime by opening `ai-logs/<your-name>.md`.
