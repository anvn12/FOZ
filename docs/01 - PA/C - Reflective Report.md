# C - Reflective Report

*Work performed by: Group 06 | Reviewed by: Nguyễn Tuấn An | Edited by: Nguyễn Tuấn An*


## 1. Team experience

### What went well:

- Agile Scrum collaboration: the team successfully adopted the Scrum methodology across all 5 PAs. We maintained regular sprint planning sessions, daily scrums, sprint reviews, and tracked progress using Jira.
- Clear domain leadership with fullstack ownership: While every member operated as a full-stack engineer, assigning domain ownership (Project Management, QA/Testing, Backend/Database, UI/UX Design, and Frontend Architecture) enabled efficient guidance and specialized accountability.
- Strict quality control: mandatory peer reviews, automated TypeScript compile checks (`tsc --noEmit`), Zod trust-boundary schema validations, and extensive Vitest integration test suites ensured high code quality and zero regressions across sprints.
- Architectural Cohesion: Establishing a single source of truth in `src/shared/` for Zod schemas, DTOs, and enums eliminated API contract discrepancies between the React frontend and Express backend.
- Successful Multi-Cloud Production Deployment: The team successfully delivered and deployed a production-grade web application with a live frontend on Vercel Edge CDN, containerized backend API on Railway, fully managed PostgreSQL on Aiven, image CDN on Cloudinary, and Google Cloud Platform integrations (OAuth 2.0 and Gemini API).
- Gradually improve our product based on lecturer's feedback from each PA.
- Successfully apply software engineering foundations on a real project (e.g. testing, diagram drawing, etc.)

### Challenges during the project:

- Time management & heavy workload: balancing heavy course commitments, midterm exams, and intensive development sprints required diligent backlog prioritization and front-loading critical tasks early in each sprint.
- AI results not good on document tasks: AI shows flaws when dealing with document writing, it lacks creativity and logical coherence.
- Deploy challenge: as we do not have enough facility for solid deployment services, we only choose free-tier with limited bandwidth, storage, and computing power. It is not stable for production-grade deployment and we have changed 2 services for backend and database hosting services due to resource limitation.
- Lack of hands-on experience, especially when dealing with web development.

## 2. Spec Kit experience

### How was the experience of using Spec Kit for specification-driven development?

Using Spec Kit transformed our development approach from informal prompting into a structured, specification-driven engineering lifecycle (`specify` -> `clarify` -> `plan` -> `tasks` -> `implement`). Defining formal feature specifications, data models, and API contracts before writing code forced the team to thoroughly evaluate edge cases, validation boundaries, and dependencies upfront. This systematic workflow minimized rework and ensured that the implementation directly fulfilled the functional requirements.

### Benefits compared to traditional development:

- Early disambiguation & reduced rework: Spec Kit surfaces ambiguous requirements during the `specify` and `clarify` phases, resolving architectural questions before they manifest as costly bugs in production.
- Granular, dependency-ordered task decomposition: The `tasks.md` breakdown allowed our team members can review before actual implementation.
- Living architectural documentation: The artifacts generated in the `specs/` directory serve as clear, evergreen documentation of the system's design, API contracts, and testing requirements, making onboarding and code reviews seamless.
- Enhanced AI context & code generation quality: Spec Kit provides AI coding assistants with rich contextual anchors (schemas, project constitution, directory conventions), resulting in higher accuracy and minimal hallucinations.

### Limitations compared to traditional development:

- Upfront process overhead: Generating specs, research notes, contracts, and task checklists requires significant initial time investment, which can feel heavy for trivial UI adjustments or minor bug fixes.
- Maintenance and artifact synchronization: When requirements evolve rapidly during prototyping, keeping all related SpecKit documents (`spec.md`, `plan.md`, `tasks.md`) synchronized with the actual codebase demands continuous manual discipline.
- Tooling and prompt dependency: Effective use of Spec Kit requires familiarity with specific prompt commands and token management; poor prompts can lead to oversized task lists or generic boilerplate.
- Token limitation: Spec Kit or any vibe engineering methods often depend on AI tokens. The limitation of tokens and decent models can sometimes make it difficult to generate a quality codes, specifications.
- Setup Spec Kit and skill sets is time-consuming and not easy for beginners.
- Harder to learn new coding terminologies.


## 3. AI tools usage

### How AI coding tools contributed to the project:

AI coding assistants such as Google Antigravity (Gemini 3.7 Flash, Gemini 3.1 Pro), GitHub Copilot (GPT-4o, GPT-5.4 mini) deeply integrated into every phase of the software development lifecycle. They assisted in:

- Rapidly scaffolding backend route handlers, Drizzle schemas, and Zod validation DTOs.
- Designing responsive React UI components with Tailwind CSS based on wireframe specifications.
- Generating comprehensive Vitest integration tests covering edge cases, authentication gating, and interaction flows.
- Executing SpecKit specification and planning workflows from natural-language requirements.
- Rapidly write draft version for the document required for PA submissions.
- Maintaining continuous development transparency via automated logging in `ai-logs/<username>.md`.

### Effective aspects:

- Accelerated Boilerplate & CRUD Development: Scaffolding REST endpoints, data access layers, and type definitions took minutes instead of hours, significantly boosting team velocity.
- Comprehensive Test Case Generation: AI tools excelled at identifying boundary conditions (e.g., empty arrays, invalid JWTs, SQL injection payloads, long unicode inputs, rate limits) and writing extensive automated test suites.
- Strict Architectural Adherence: When supplied with our project constitution (`constitution.md`) and routing guidelines (`AGENTS.md`), the AI consistently enforced team conventions (e.g., `/api/v1` route prefixing, modular client-server isolation).
- Rapid Debugging & Error Diagnosis: AI assistants quickly identified root causes for subtle bugs, such as session cookie ID mismatches and Vite proxy misconfigurations.

### Limitations encountered:

- Superficial "Smoke Test" Generation: AI models sometimes generated shallow assertions (e.g., verifying `typeof fn === 'function'` or duplicating sorting logic in tests) rather than writing genuine end-to-end database queries, requiring manual test refinement during QA reviews.
- Context Degradation in Long Conversations: Over prolonged sessions, AI agents occasionally lost track of existing utility functions or attempted to re-implement already available helpers.
- Outdated Suggestions: AI occasionally suggested not suitable services. When our team first asked AI about services for deployment, the AI suggest those with low bandwidth leading to the service change later. 

## 4. SDLC feedback

Constructive suggestions for improving the Software Development Life Cycle (SDLC) process and course structure:

1. Detailed and Actionable Grading Feedback:
   - Feedback on previous PA submissions was occasionally brief or lacked specific breakdowns, making it difficult for the team to understand exact grading criteria or identify which specific sections lost marks. Also there should be more instruction or more meeting in class.
   - Suggestion: Provide a transparent, itemized rules with specific feedback comments for each milestone. This will give student teams concrete guidance on areas needing improvement before the subsequent submission.

2. Up-to-date and Centralized Course Documentation:
   - Some requirement documents and template files contained outdated instructions or ambiguous specifications that required clarification across different communication channels (e.g. Moodle discussion forum).
   - Suggestion: Maintain a single, updated repository for all PA templates, grading rubrics, and technical requirements. Clarify modern stack expectations (e.g., TypeScript, modern ORMs, and cloud deployments) early in the semester.

3. The documentation tasks is overhead:
   - Our team thinks that the main value of Scrum is about development and minimal documentation, especially for small team size under short period of time.
   - Suggestion: Optimize the documentation so that it is both more condensed, and more realistic for small team size.

## 5. Individual contributions

### Nguyễn Tuấn An (24127011) — Project Manager & / DevOps, Full-Stack Developer

As Project Manager, I organized sprint planning sessions, coordinated task assignments on Jira, and also established the development workflow and multi-cloud deployment pipeline across Vercel, Railway, Aiven, and Cloudinary. I implemented the Google OAuth 2.0 social login flow, the Post Summarize (TL;DR) AI service with resilient fallback chains, and led the AI summarization test suite refinement, fixed a huge number of bugs, manage the document for submission. Through this project, I gained invaluable practical experience in orchestrating end-to-end cloud infrastructure, managing agile team dynamics, and enforcing specification-driven AI development with SpecKit.

### Nguyễn Hải Nam (24127088) — QA Engineer / Full-Stack Developer

As QA Engineer, I designed and documented the system architecture (Container and Component diagrams in C4 model) and established testing protocols for the team. I implemented the User Interactions functional group—including post creation, commenting, threaded replies, and like/reaction systems—as well as the Admin dashboard management features and hashtag discovery. This project deepened my expertise in architectural modeling, Drizzle ORM data persistence patterns, and building rigorous automated test suites for full-stack applications.

### Nguyễn Hải Trọng (24127311) — Backend & Database Lead / Full-Stack Developer

As Backend and Database Lead, I created the System Context architectural model and designed the relational PostgreSQL database schema with Drizzle ORM. I implemented the Profile Management functional group, including backend REST APIs, secure password updating, Zod input validation schemas, and corresponding Vitest integration test suites. Through this experience, I mastered relational data modeling, secure trust-boundary validation, and professional test-driven backend development.

### Phạm Đinh Gia Khánh (24127420) — UI/UX Designer & Full-Stack Developer

As UI/UX Designer, I led the user experience design and wireframing for the entire application and translated Figma prototypes into responsive React components using Tailwind CSS. I engineered the Moderator Portal (reports queue, violation reviews, and escalation workflows), the Administrator dashboard UI, and the user post reporting mechanism. This project significantly strengthened my abilities in React component architecture, role-based UI access control (RBAC), and user-centric frontend development.

### Võ An Phú (24127494) — Frontend Lead & Full-Stack Developer

As Frontend Lead, I initialized the frontend codebase using Vite, React 19, and Tailwind CSS, and established frontend architectural standards. I developed the complete User Authentication slice (JWT memory management, secure HTTP-only refresh cookies, bcrypt hashing, and session rotation), built the Feed Generation algorithm ("For You" feed), and created the project demonstration videos. Through this project, I gained comprehensive knowledge in secure web authentication lifecycles, global client state management with Zustand and TanStack Query, and automated SpecKit implementation workflows.