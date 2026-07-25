# A - Revised Project Plan

Work performed by: Nguyễn Hải Nam | Reviewed & Edited by: Nguyễn Tuấn An

| Section | Subsection | Subsubsection | Before | After | Purpose |
| --------- | ------------ | ---------------- | -------- | ------- | --------- |
| 1. Introduction | - | - | Same content | Same content | No changes because the introduction content remains identical |
| 2. Project Overview | - | - | Bullet points with asterisks (*) | Bullet points with dashes (-) | No content changes because only bullet character formatting changed |
| 3. Project Organization | - | - | Same content | Same content | No changes because the project organization content remains identical |
| 3.1 Team Structure and Member Roles | - | - | Same content | Same content | No changes because team structure and roles remain unchanged |
| 3.2 Risk Management | - | - | Bullet points with asterisks (*) | Bullet points with dashes (-) | No content changes because only bullet character formatting changed |
| 4. Project Plan | - | - | Same opening statement | Same opening statement | No changes because the Scrum process description remains identical |
| 4.1 Completed Sprint | - | - | Sprint 1 - PA1 only | Sprint 1 - PA1, Sprint 2 - PA2 | Updated to include both completed sprints |
| 4.1 Completed Sprint | 4.1.1 Sprint 1 - PA1 | - | Not a subsection | Created as subsection 4.1.1 | Restructured to accommodate multiple completed sprints |
| 4.1.1 Sprint 1 - PA1 | - | - | Content right under 4.1 | Same content moved to subsection | No content changes because Sprint 1 achievements remain identical; only structural reorganization |
| 4.1 Completed Sprint | 4.1.2 Sprint 2 - PA2 | - | Not present | Created as subsection 4.1.2 | Added new subsection for Sprint 2 achievements |
| 4.1.2 Sprint 2 - PA2 | - | - | Not present | Added detailed achievements including Project Plan, Vision Document, Spec Kit Initialization, AI Usage Report and Weekly Report, Authentication Implementation Delay | Documented Sprint 2 completion status and specific deliverables achieved |
| 4.2 Upcoming Sprint | - | - | Sprint 2 - PA2 with detailed task table | Sprint 3 - PA3 with main goal bullet points and task table | Updated to reflect current upcoming sprint with Sprint 2 completed and Sprint 3 as next focus |
| 4.3 Future Sprints | - | - | Sprint 3, Sprint 4, Sprint 5 described in paragraph format | Sprint 4, Sprint 5 only; Sprint 3 moved to upcoming | Updated to reflect Sprint 3 is now upcoming, not future |
| 4.3 Future Sprints | 4.3.1 Planned Tasks | - | - | Created as subsection 4.3.1 | Restructured for better organization of future sprint planning |
| 4.3.1 | Planned Tasks | - | Sprint 3, Sprint 4, Sprint 5 content | Sprint 4 and Sprint 5 content only | No content changes for Sprint 4 and Sprint 5 because their planned tasks remain identical; Sprint 3 moved to upcoming section |
| 4.4 Schedule | - | - | Same content | Same content | No changes because schedule management approach remains identical |
| 4.5 Build Plan | - | - | Build 1.0 (Alpha) description without status | Build 1.0 (Alpha) with status "Upcoming" | Added status indicator to reflect current build phase progress |
| 4.5 Build Plan | - | - | Build 2.0 and Build 3.0 descriptions | Same descriptions | No changes because Build 2.0 and Build 3.0 plans remain identical |

# B - Detailed Vision Document

Work performed by: Nguyễn Hải Trọng | Reviewed by: Võ An Phú | Edited by: Nguyễn Hải Trọng

| Section | Subsection | Subsubsection | Before | After | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Title / Meta | - | - | Vision Document Version 1.0 | Detailed Vision Document Version 1.2 | Updated document title and version number |
| Table of Contents | - | - | Plain text list without navigation links | Added Markdown anchor links (e.g., `[1. Introduction](#1-introduction)`) | Formatted Table of Contents for seamless section navigation |
| Document History | Vision (Small Project) | - | Included revision entries for Version 1.0 and 1.1 only | Added entry on 24/07/2026 for Version 1.2 | Documented the latest revision history details |
| 3. Stakeholder and User Descriptions | 3.3 User Environment | - | Short paragraph stating general browser access and internet-connected devices | Expanded into structured bullet points covering Supported Devices, Operating Systems, Supported Browsers (Chrome v90+, Safari v14+, etc.), and Network Requirements | Provided concrete, detailed technical specifications for user environment constraints |
| 3. Stakeholder and User Descriptions | 3.5 Alternatives and Competition | - | Brief analysis of Reddit and Threads based on the PA1 survey | Added explicit details on how FOZ overcomes competitors' drawbacks (e.g., providing chronological/engagement feeds without intrusive recommendation algorithms) | Clarified the competitive positioning of FOZ in the market |
| 6. Non-Functional Requirements | Performance Requirements | - | Basic constraints for page load time (< 2s), API response time (< 500ms), and concurrent users (100) | Added frontend routing speed constraint (< 200ms) and explicitly listed comment queries under API response time limits | Established a more comprehensive and measurable user performance benchmark |
| 6. Non-Functional Requirements | Security Requirements | - | High-level security principles | Specified exact technology stack implementations (PostgreSQL, bcrypt/argon2 hashing, Zod schemas, JWT with HttpOnly SameSite cookies, per-IP rate limiting) | Defined explicit security technologies across Frontend, Backend, and Database layers |
| 6. Non-Functional Requirements | Reliability & Availability Requirements | - | Basic requirements for AI TL;DR graceful degradation and logging | Set a target 99.9% uptime metric for core features and clarified system logging for monitoring, debugging, and incident reviews | Provided explicit reliability metrics and incident management standards |
| 6. Non-Functional Requirements | Platform & Usability Requirements | - | General requirements for responsive design, cross-browser support, and usability | Specified Tailwind CSS usage, explicit browser version support, and compliance with basic WCAG accessibility guidelines (semantic HTML, alt-text, color contrast) | Concrete UI implementation standards, browser targets, and accessibility requirements |