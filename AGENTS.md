## IRON RULES
- Always use the AI usage logging skill in /home/shiki/FOZ/.agents/skills/ai-usage-log.
- After any turn that modifies source or code-adjacent files, append the AI usage log entry before ending the turn.
- Do not treat documentation-only edits as exempt if they are part of a turn that also changes source or code-adjacent files.
- **NEVER `git add` or `git commit` anything under `ai-logs/`.** The directory is `.gitignore`d for a reason — the AI usage log is a local-only audit trail. The skill writes the file; the file is never part of the repo's history. If you find yourself about to commit an `ai-logs/<user>.md` change, that's a bug — unstage it.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan.

**SpecKit directory location:** the `.specify/` directory (memory,
templates, extensions, workflows) lives **in this directory** —
`/home/shiki/FOZ/src/.specify/` — NOT at the repo parent
`/home/shiki/FOZ/.specify/`. Always read `.specify/memory/constitution.md`
first for binding project principles and the technology stack, and use
`.specify/templates/` for plan/spec/tasks/checklist scaffolding.
<!-- SPECKIT END -->
