<!--
SYNC IMPACT REPORT
==================
Version change: TEMPLATE → 1.0.0 (initial population)

Principles added:
  - I. Modular Client-Server Architecture (new)
  - II. Enforced Folder Structure (new)
  - III. Clean Code & Reusability (new)
  - IV. Security at Every Layer (new)
  - V. AI Service Abstraction (new)
  - VI. Consistency Over Cleverness (new)

Sections added:
  - Core Principles (6 principles)
  - Quality Standards
  - Governance

Templates reviewed:
  ✅ .specify/templates/plan-template.md — Constitution Check section is dynamically resolved; no update needed
  ✅ .specify/templates/spec-template.md — No constitution-specific references; no update needed
  ✅ .specify/templates/tasks-template.md — Task categories (security hardening, error handling) align with principles; no update needed

Deferred TODOs:
  - None
-->

# FOZ Constitution

## Core Principles

### I. Modular Client-Server Architecture

The project MUST maintain strict separation between client and server.
The client layer MUST NOT contain business logic; the server layer MUST NOT
embed presentation concerns. Each side MUST be independently runnable,
testable, and deployable. Cross-cutting concerns (auth tokens, shared types)
MUST be placed in explicitly defined shared contracts, not in either layer
directly.

Rationale: Prevents coupling that makes the system brittle to change and hard
to scale independently.

### II. Enforced Folder Structure

Every module, file, and asset MUST reside in a predictable, agreed-upon
location derived from the project's folder conventions. Deviations MUST be
justified in writing and approved before implementation. The folder structure
MUST be documented in the plan artifact and treated as a first-class design
decision, not an afterthought.

Rationale: Predictable structure reduces onboarding time and prevents
organizational debt from accumulating.

### III. Clean Code & Reusability

Code MUST be written for the next reader, not the current author. Components,
utilities, and service functions MUST be designed for reuse before duplication
is permitted. Error handling MUST be centralized — each architectural layer
MUST expose errors through a single, consistent mechanism. Inline error
swallowing is forbidden; errors MUST propagate explicitly to a designated
handler.

Rationale: Duplication and scattered error handling are the primary sources of
maintenance cost in long-lived projects.

### IV. Security at Every Layer

Authentication and authorization MUST be enforced at every architectural
boundary, not only at the entry point. Input validation MUST occur at the
point of ingestion (API boundary) and MUST NOT be skipped for "internal"
calls. Sensitive data MUST never be logged or exposed in error responses.
Role-based access control (User / Admin) MUST be a first-class concern
implemented consistently across all protected resources.

Rationale: Security added as a bolt-on after the fact is consistently
inadequate; it must be structural.

### V. AI Service Abstraction

All AI-powered features (e.g., post summarization) MUST be implemented behind
a dedicated service interface. The underlying AI provider (model, API, or
library) MUST be swappable without changes to business logic or API contracts.
AI calls MUST be isolated, have explicit error boundaries, and MUST NOT block
core user flows if unavailable.

Rationale: AI providers change rapidly; abstraction prevents vendor lock-in
and ensures system resilience when AI services are degraded or replaced.

### VI. Consistency Over Cleverness

Patterns established in one part of the codebase MUST be followed everywhere
they apply. Novel or clever solutions MUST be avoided when a conventional
approach exists. When a new pattern is introduced, it MUST be documented and
applied consistently going forward — not used once as a one-off. Code that
surprises the reader requires justification.

Rationale: Inconsistency is a hidden form of complexity. Predictability
reduces bugs, speeds reviews, and lowers cognitive load.

## Quality Standards

All code reaching the main branch MUST:

- Pass linting and formatting checks with zero warnings.
- Have error handling routed through the centralized error mechanism (no
  silent catch blocks).
- Include no dead code, commented-out blocks, or debug artifacts.
- Respect the folder structure defined in the feature plan.
- Pass role-based access checks for any protected resource.

Performance and scalability expectations are feature-specific and MUST be
documented in each feature's plan.md under Technical Context.

## Development Workflow

- Features MUST begin with a spec, then a plan, then task generation before
  any implementation starts.
- Each task MUST reference its user story and phase.
- Security hardening and error handling tasks are NOT optional polish — they
  are part of every implementation phase.
- AI-related tasks MUST include an explicit abstraction layer task before
  implementing AI provider integration.

## Governance

This constitution supersedes all other coding conventions and informal
agreements in the project. Amendments require:

1. A written proposal describing the principle change and rationale.
2. Version bump per semantic versioning rules (MAJOR/MINOR/PATCH).
3. Update to `LAST_AMENDED_DATE`.
4. Propagation check against all `.specify/templates/*.md` files.

All implementation plans MUST include a Constitution Check section that
validates the feature design against these principles before Phase 0 research
begins. Non-compliance MUST be explicitly justified in the plan's Complexity
Tracking section.

**Version**: 1.0.0 | **Ratified**: 2026-06-04 | **Last Amended**: 2026-06-04
