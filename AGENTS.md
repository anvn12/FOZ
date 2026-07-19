## IRON RULES
- Always use the AI usage logging skill in /home/shiki/FOZ/.agents/skills/ai-usage-log.
- After any turn that modifies source or code-adjacent files, append the AI usage log entry before ending the turn.
- Do not treat documentation-only edits as exempt if they are part of a turn that also changes source or code-adjacent files.
- **Do not `git add` or `git commit` the AI usage log file as part of a routine auto-commit or cleanup.** The skill writes the entry to `ai-logs/<username>.md`; that file lives in the working tree but is not part of a routine commit. If the user explicitly asks for the log to be committed (e.g., to share with the team, or to clean up the working tree), do so on request — but **never commit it without explicit user permission.** If a tool call, hook, or follow-up step is about to commit the log without being asked, stop and confirm with the user first.

## API ROUTING CONVENTION
- All API endpoints live under the `/api/v1` prefix. This is applied once in `src/backend/index.ts` via an `apiRouter` mounted with `app.use("/api/v1", apiRouter)`.
- When adding a new API resource, create its `Router()` in `src/backend/api/<resource>/routes.ts` (export it, e.g. `userRouter`), then mount it on `apiRouter` in `src/backend/index.ts` with **no prefix**: `apiRouter.use("/users", userRouter)`. The `/api/v1` prefix is inherited — do not write it manually on sub-routers.
- Routes that must NOT be versioned (e.g. `/health`) are mounted directly on `app`, outside `apiRouter`.

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
