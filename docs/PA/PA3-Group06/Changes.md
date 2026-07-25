# Changes from PA2 to PA3

This document records all changes made to the **Project Plan** and **Vision Document** between PA2 (2A/2B) and PA3 (3A/3B).

---

# A - Project Plan (2A → 3A Revised Project Plan)

Work performed by: Nguyễn Hải Nam | Reviewed & Edited by: Nguyễn Tuấn An

| Section | Subsection | Before (2A) | After (3A) | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| Title / Meta | - | "Author: Nguyễn Hải Nam / Reviewer and Editor: Nguyễn Tuấn An" | "Work performed by: Nguyễn Hải Nam / Reviewed & Edited by: Nguyễn Tuấn An" | Updated attribution format |
| 2. Project Overview | - | Bullet points with asterisks (`*`) | Bullet points with dashes (`-`) | Formatting consistency |
| 3.2 Risk Management | - | Bullet points with asterisks (`*`) | Bullet points with dashes (`-`) | Formatting consistency |
| 4.1 Completed Sprint | - | "Sprint 1 - PA1" only | "Sprint 1 - PA1, Sprint 2 - PA2" with subsections 4.1.1 and 4.1.2 | Documented Sprint 2 completion |
| 4.1.1 Sprint 1 - PA1 | - | Content directly under §4.1 | Moved to its own subsection under §4.1 | Structural reorganization for multiple completed sprints |
| 4.1.2 Sprint 2 - PA2 | - | Not present | New subsection with achievements: Project Plan, Vision Document, Spec Kit Initialization, AI Usage Report, authentication delay | Documented Sprint 2 deliverables and blockers |
| 4.2 Upcoming Sprint | - | "Sprint 2 - PA2" with 20-row task table | "Sprint 3 - PA3" with 14-row task table and main goal bullets | Updated to reflect current sprint after Sprint 2 completion |
| 4.3 Future Sprints | - | "Sprint 3, Sprint 4, Sprint 5" in paragraph format | "Sprint 4, Sprint 5" only; Sprint 3 moved to §4.2 | Sprint 3 is now upcoming, not future |
| 4.3 Future Sprints | 4.3.1 Planned Tasks | - | New subsection | Better organization of future sprint planning |
| 4.3.1 Planned Tasks | - | Sprint 3, 4, 5 content | Sprint 4 and Sprint 5 content only (Sprint 3 moved) | No content change for Sprint 4/5; Sprint 3 relocated |
| 4.5 Build Plan | - | Build 1.0 described without status | Build 1.0 with "(Status: **Upcoming**)" | Added progress indicator for current build phase |

**Summary of 2A → 3A changes:**
- Structural reorganization: Sprint 2 moved from "upcoming" to "completed" with documented achievements
- Sprint 3 moved from "future" to "upcoming" with updated task table
- Build 1.0 status indicator added
- Formatting normalization (asterisks → dashes)
- No changes to: Introduction, Team Structure, Risk Management content, or Schedule

---

# B - Vision Document (2B → 3B Detailed Vision Document)

Work performed by: Nguyễn Hải Trọng | Reviewed by: Võ An Phú | Edited by: Võ An Phú

| Section | Subsection | Before (2B) | After (3B) | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| Title / Meta | - | "Author: Nguyễn Hải Trọng / Reviewer: Võ An Phú" | "Work performed by: Nguyễn Hải Trọng / Reviewed by: Võ An Phú / Edited by: Võ An Phú" | Updated attribution format |
| Version | - | Version 1.0 (07/07/2026) | Version 1.3 (25/07/2026) with revision history for v1.1, v1.2, v1.3 | Documented iterative revisions |
| Table of Contents | - | Present (plain text, no links) | Removed | TOC removed for conciseness |
| 1. Introduction | - | Double blank line after heading | Single blank line | Formatting fix |
| 2. Positioning | 2.2 Product Position Statement | "text-based community dialogue" | "community dialogue — supporting text, images, and video" | Reflected media upload support |
| 3. Stakeholder and User Descriptions | 3.2 User Summary (Admin) | "Complete control over database records" | "Full control via the admin dashboard... All actions are performed through the application UI, not direct database access" | Clarified admin access scope |
| 3. Stakeholder and User Descriptions | 3.3 User Environment | Single paragraph: "standard web browsers... responsive... internet-connected devices" | Structured bullets: Supported Devices (320px–4K), Operating Systems (5 listed), Supported Browsers (with version numbers), Network Requirements ("uploading images and videos") | Detailed technical specifications |
| 3. Stakeholder and User Descriptions | 3.5 Alternatives and Competition | Brief per-competitor analysis based on PA1 survey | Detailed analysis with explicit FOZ positioning (e.g., "FOZ focuses on chronological/engagement-based feeds without intrusive algorithmic manipulation") | Clarified competitive differentiation |
| 4. Product Overview | 4.2 Assumptions and Dependencies | Two separate bullets: "AI API Availability" (general) and "AI Provider Fallback" (detailed) | Single merged bullet about fallback provider chain | Removed redundancy |
| 4. Product Overview | 4.3 Scope Boundaries | "defined in 5" (plain text), "text discussions" in out-of-scope | Anchor link to §5, "(text, images, video)" added to in-scope, removed "text discussions" from out-of-scope | Fixed reference, reflected media support |
| 5. Product Features | - | Features ordered 1–8 with High/Medium interleaved, verbose descriptions, "text-based" references | Reordered by priority (High: 1–5, Medium: 6–8), concise descriptions, media support (images/video) throughout | Improved scannability, trimmed verbosity, reflected media capability |
| 6. Non-Functional Requirements | Performance | Page load < 2s, API < 500ms (feeds, posts), 100 concurrent users | Added: frontend routing < 200ms, "querying comments" under API scope | More comprehensive performance benchmarks |
| 6. Non-Functional Requirements | Security | "bcrypt", "validated server-side", "httpOnly cookies/tokens with CSRF", rate-limit per user on TL;DR only | "bcrypt or argon2", "PostgreSQL database", "strictly validated using robust schema validation", "HttpOnly, SameSite cookies with JWT tokens", rate-limit per user/IP on TL;DR and auth routes | Specified technologies, expanded security scope |
| 6. Non-Functional Requirements | Security (new) | Not present | Added: data privacy requirement (account deletion, no third-party data sharing) | Addressed user data rights |
| 6. Non-Functional Requirements | Reliability | "log errors", graceful degradation for AI | Added: 99.9% uptime target, "log critical errors", "monitoring, debugging, and incident review" | Explicit reliability metrics |
| 6. Non-Functional Requirements | Platform | "fully responsive", cross-browser, basic usability | Added: responsive design principles, WCAG guidelines (semantic HTML, alt-text, color contrast), keyboard navigation, screen reader support (ARIA), tested on latest stable browsers | Strengthened accessibility and usability standards |

**Summary of 2B → 3B changes:**
- Media support (images/video) reflected throughout (positioning, scope, features, network requirements)
- User Environment expanded from one paragraph to structured technical specs
- Alternatives section expanded with explicit competitive positioning
- Features reordered by priority with concise descriptions
- Security NFRs specified (argon2, PostgreSQL, JWT, schema validation) and expanded (data privacy, rate-limit scope)
- Reliability NFRs strengthened (99.9% uptime, critical error logging)
- Platform NFRs strengthened (WCAG, keyboard navigation, screen readers)
- TOC removed, formatting fixes applied
- No changes to: Introduction content, Problem Statement, Stakeholder/User Summary (except Admin clarification), Product Perspective, Key Workflows (Mermaid diagrams)
