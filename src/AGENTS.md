## IRON RULES
- Always use the AI usage logging skill in /home/shiki/FOZ/.agents/skills/ai-usage-log.
- After any turn that modifies source or code-adjacent files, append the AI usage log entry before ending the turn.
- Do not treat documentation-only edits as exempt if they are part of a turn that also changes source or code-adjacent files.

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
