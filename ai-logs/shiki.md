# FOZ — pi AI Usage Log

**Author:** Võ An Phú (24127494)  
**Report date:** 2026-07-11  
**Project:** FOZ — web-based forum application (CS300 PA project, Team 6)  
**Source:** pi coding-agent JSONL transcripts under `~/.pi/agent/sessions/`  
**Scope:** only sessions whose working directory is under `/home/shiki/FOZ/` (i.e. `FOZ` and `FOZ/src`).

## 1. AI Assistant Used

All AI assistance on the FOZ project was via **pi** (`@earendil-works/pi-coding-agent`), a CLI coding-agent harness. pi routes prompts to configurable LLM providers; the providers/models actually used on the FOZ project are listed below.

### Providers / models used

| Provider | Model |
| --- | --- |
| opencode-go | glm-5.2 |
| opencode-go | kimi-k2.6 |

A session listing several models means the provider was switched mid-conversation (quota/fallback). pi records each switch as a `model_change` event.

## 2. What is and isn't logged

- **Logged:** every author prompt, model switches, basic counts, and the file/tool actions each prompt led to (files changed, created, inspected, or commands run), reconstructed from local pi JSONL transcripts.


## 3. Totals

| Metric | Value |
| --- | --- |
| Sessions | 3 |
| Date range | 2026-07-08 → 2026-07-10 |
| Author prompts | 28 |
| Assistant responses | 82 |
| Tool-call results | 57 |

> The assistant response count exceeds the prompt count because each tool-call step (read/edit/bash) emits its own assistant message; one author turn often produces several assistant turns. Short confirmations such as "go"/"ok" are counted in the totals but drove no separate file changes.

## 4. Sessions

| Started | Work dir | Model(s) | Prompts | Responses | First prompt |
| --- | --- | --- | ---: | ---: | --- |
| 2026-07-08 20:18 | FOZ | opencode-go:glm-5.2 | 5 | 29 | i have wrote a basic review of the vision doc in /home/shiki/FOZ/docs/2B. Vision Document.md What do you think?|
| 2026-07-08 22:06 | FOZ | opencode-go:glm-5.2 | 19 | 33 | i propose a frontend techstack liek this, what do you think? |
| 2026-07-10 23:40 | FOZ | opencode-go:glm-5.2 | 4 | 20 | my teammate just implemented the db in /home/shiki/FOZ/src/src/backend/db would i be able to impelment authN now? becasuse i think i need to scalfold the FE and set tup query layer of drizzle first |

## 5. Chronological prompt log

Each entry shows the author's exact prompt followed by what it led to (files changed, inspected, or commands run). Short acknowledgement prompts that drove brainstorming steps only are marked "(discussion only)".

### FOZ (root) (3 sessions)

**Session 1** — 2026-07-08 20:18 · models: opencode-go:glm-5.2

1. i have wrote a basic review of the vision doc in /home/shiki/FOZ/docs/2B. Vision Document.md What do you think?
   - Inspected: `2B. Vision Document.md`, `1B. Project Proposal.md`, `2A. Project Plan.md`; listed `/docs/`.
   - No file changes — review only.

2. - For 6. Ambiguities in role capabilities, guest is read only, no AI for them. For other fixes, fix as you see fit if you have any Ambiguities, ask me first
   - Changed: `docs/2B. Vision Document.md` (clarified guest read-only + no AI TL;DR, resolved role-capability ambiguities).
   - Inspected: `2B. Vision Document.md` before/after via targeted `sed`/`grep` reads.

3. the diagram for moderation is a bit of a mess, seperate them into 3 use case and be more careful of actions of each use cases
   - Changed: `docs/2B. Vision Document.md` (split the single moderation flow into three distinct Mermaid workflows: User reports → Moderator reviews → Admin acts on escalated).

4. after these changes recheck the constitiution in /home/shiki/FOZ/src/.specify/memory/constitution.md to see if we need to change to constitution
   - Inspected: `src/.specify/memory/constitution.md`.
   - No changes — constitution still aligned.

5. - q1: 1 table.
   - Changed: `src/.specify/memory/constitution.md` and `docs/2B. Vision Document.md` (applied the "1 table" decision; tightened report-subject wording so content and user reports share one table).

**Session 2** — 2026-07-08 22:06 · models: opencode-go:glm-5.2

1. i propose a frontend techstack liek this, what do you think?
   - Inspected repo state: `README.md`, `UI designs/`, `src/AGENTS.md`, `package.json`.
   - No file changes — review/discussion of the proposed stack.

2. -Q1: i think the socket.io is needed because if we dont client would have to poll /api/threads for example to updates new threads,... With it: server pushes ...
   - Changed: created `docs/frontend/techstack.md` (wrote the agreed frontend techstack).
   - Inspected: `docs/` to confirm target location.

3. wait if i want to impelment the tldr and ai stuff, can i still use ts as the backend language ?
   - Rationale produced (TS-for-both decision). No file changes — decision logged in the brainstorm.

4. `<skill name="brainstorming" ...>` — (discussion only, no file actions)

5. `<skill name="brainstorming" ...>` — (discussion only, no file actions)

6. A — (discussion only, no file actions)

7. actually we also want trending recommendation also but we are just thinking of using some simple algorithm to calculate what is a trending thread based on th...
   - Trending/feed scoring approach agreed (SQL scoring, not ML). No file changes — captured in the eventual backend doc.

8. go — (discussion only, no file actions)

9. go express — (discussion only, no file actions)

10. me and my team know next to nothing about database, but i know that sqlite is hard to deploy so postgre is fine. About ORM, we kind of only know raw SQL and ...
    - Decisions: Express web framework, PostgreSQL, Drizzle ORM over raw SQL. No file changes — brainstorming.

11. ok go — (discussion only, no file actions)

12. go — (discussion only, no file actions)

13. ok — (discussion only, no file actions)

14. wait go back to section 4, sorry nut did you mention refresh token http only? i think i should stay away from cookie and use a refresh token storing ...
    - Auth token strategy re-discussed. No file changes — reasoning only.

15. go a — (discussion only, no file actions)

16. go — (discussion only, no file actions)

17. ok — (discussion only, no file actions)

18. go — (discussion only, no file actions)

19. go write
    - Changed: created then edited `ideas/backend-techstack.md`, then committed it (`docs: add backend techstack`).
    - Inspected: scanned `ideas/backend-techstack.md` for TBD/TODO placeholders.

### src (0 sessions in scope)

No `src`-directory sessions fall in the curated 3-session set above; the two `FOZ/src` sessions (2026-06-30 spec-kit git extension setup, 2026-07-10 `AGENTS.md`/template-path fix) were outside the curated window and are excluded per the author's trim.

## 6. Summary of AI use by phase

- **Jul 8 (evening) — Vision document & techstack.** Reviewed and fixed the vision document (role capabilities, moderation workflow split into three use cases, single report-table decision), then cross-checked it against `.specify/memory/constitution.md`. In a separate brainstorming session validated the frontend stack (React/Vite/Tailwind/socket.io-client) and the backend stack (Node/Express/PostgreSQL/Drizzle, JWT access + refresh, AI provider fallback), and wrote both decisions down as `docs/frontend/techstack.md` and `ideas/backend-techstack.md`.
- **Jul 10 — DB schema review and authN plan.** Reviewed the teammate's Drizzle schema under `src/src/backend/db`, checked it against the spec-kit feature (`specs/001-threads-schema`), wrote the formal review to `src/specs/001-threads-schema/review.md`, and lined up the spec-kit workflow for building the query layer and authN next.

## 7. Notes

- pi does not collect telemetry; the JSONL files used here live only on the author's machine under `~/.pi/agent/sessions/` and this report can be regenerated from them on request.
- Model switches inside a session are `model_change` events.
- Counts measure *message turns*, not human-meaningful conversations; a single author turn often generates several assistant turns (read/think/edit/answer).
- "Inspected" means the assistant read the file to inform its answer without modifying it; "Changed" means the file was edited or created; commands run are only listed when material to the outcome.