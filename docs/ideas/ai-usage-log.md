# AI Usage Log Skill — Ideas

## Purpose
Log AI-assisted code changes across a team where members use different tools:
- **shiki** uses pi (coding agent)
- **teammates** use GitHub Copilot Chat in VS Code

## Log Storage
- Directory: `ai-logs/` at repo root
- One markdown file per person: `ai-logs/shiki.md`, `ai-logs/<teammate>.md`
- All files tracked in git

## Log Entry Format (same for everyone)
```markdown
### 2026-07-10 14:52
**Tool:** pi | Copilot Chat
**Prompt:** "refactor the auth middleware to use JWT"
**Files touched:** `src/backend/auth.js`, `src/backend/middleware.js`
```
- No `**Who:**` field — filename identifies the person
- Timestamp in ISO format, local time

## For Pi User (shiki)
### Skill: `ai-usage-log`
- Auto-loads in every pi session via `~/.pi/settings.json` or `--skill`
- After any turn with `write`/`edit` tool calls on code files, appends entry to `ai-logs/shiki.md`
- Only logs the **current turn's prompt** (the one that triggered the edits)
- **Skips:**
  - Read-only sessions (no file modifications)
  - `.md` files in `docs/` or `ai-logs/` itself (log the log, design-only docs)
  - Brainstorming/design turns where code was not requested

## For Teammates (Copilot Chat in VS Code)
### Git Hooks in `.githooks/`
Tracked in the repo so everyone gets them on clone.

#### `.githooks/prepare-commit-msg`
Prepends commit message template:
```
[AI-PROMPT] <paste your Copilot Chat prompt here, or DELETE THIS LINE if no AI was used>

<type your commit message below>
```

#### `.githooks/post-commit`
- Reads the commit message just made
- If `[AI-PROMPT] <text>` exists and has text:
  - Extracts the prompt text
  - Gets username from `git config user.name`
  - Lists files from `git diff-tree --no-commit-id --name-only -r HEAD`
  - Appends entry to `ai-logs/<username>.md`
- If `[AI-PROMPT]` line was deleted or left empty → **no log entry** (avoids false positives)

### Setup
One-time per clone:
```bash
git config core.hooksPath .githooks
```
Documented in project README setup instructions.

## Edge Cases
| Scenario | Result |
|---|---|
| Pi session modifies code | Auto-logged to `ai-logs/shiki.md` |
| Pi session read-only or docs-only | No log entry |
| Teammate uses Copilot, pastes prompt | Logged with prompt + files |
| Teammate uses Copilot, deletes prompt line | Not logged (acceptable data loss) |
| Teammate commits manual work, deletes line | No log entry — correct |
| Teammate commits manual work, leaves line empty | No log entry — correct |
| Merge conflicts on `ai-logs/` | Separate files per person prevent conflicts |

## Why Separate Files Per Person
- Prevents git merge conflicts when two people log simultaneously
- Allows easy personal review without scrolling through teammates' entries
- Can `.gitignore` an individual file if someone opts out

## Next Steps
1. Build the pi skill `ai-usage-log` (SKILL.md + instructions)
2. Create `.githooks/prepare-commit-msg` and `.githooks/post-commit`
3. Document one-time `git config core.hooksPath .githooks` setup in README
4. Verify with test commits and a test pi session
