# Spec-Driven Development (SDD) & GitHub Spec Kit Training Summary

## Document Metadata
*Performed by: Nguyễn Hải Trọng | Reviewed by: Nguyễn Hải Nam*


## 1. What is Spec-Driven Development (SDD)?

### Core Definition
Spec-Driven Development (SDD) is a modern software engineering methodology where **specifications serve as the primary source of truth** that drives the entire development lifecycle, rather than treating code as the sole source of truth with documentation as an afterthought. In SDD, code is viewed as a concrete expression or implementation of the underlying specifications.

### Key Characteristics & Workflow
* **Living Artifacts:** Unlike traditional static documentation that quickly becomes outdated, SDD outputs are "living artifacts." When requirements change, developers update the specifications first, allowing the system to automatically propagate those changes down to implementation plans, granular tasks, and code architectures.
* **The Four Phases:** The standard micro-cycle workflow of SDD operates through four distinct phases:
  1. **Specify:** Clearly defining user needs, edge cases, acceptance criteria, functional requirements, and non-functional requirements.
  2. **Plan:** Translating requirements into technical architecture, system design, and technology stack decisions.
  3. **Tasks:** Breaking down the architectural plan into atomic, actionable development tasks.
  4. **Implement:** Writing the actual code guided step-by-step by the generated tasks and specifications.
* **Agile & Scrum Complementarity:** SDD integrates seamlessly into Agile methodologies (like Scrum). Instead of replacing existing sprint ceremonies, SDD functions within a sprint by breaking down individual User Stories or features using the micro-cycle of Specify $\rightarrow$ Plan $\rightarrow$ Tasks $\rightarrow$ Implement.
* **Comparison with Test-Driven Development (TDD):** While TDD operates at a very low level (unit testing specific blocks of code), SDD functions at a higher abstraction level, focusing on defining and validating complete system features and user requirements.


## 2. Key Takeaways from Microsoft Learn & GitHub Spec Kit

The Microsoft Learn module introduces **GitHub Spec Kit**, an open-source toolkit designed to bridge the gap between high-level human intent and AI coding assistants (such as GitHub Copilot, Claude Code, Cursor, and Windsurf). 

### Major Concepts Learned:

#### A. Mitigating AI Context Loss
A common pitfall in AI-assisted development is that AI chat models lose context across long or fragmented sessions. GitHub Spec Kit solves this by **storing all specifications, architectural plans, and task breakdowns as structured Markdown files directly within the project repository**. This ensures that the AI assistant can always reference the historical context of the project instantly.

#### B. The Greenfield Development Sequence
For a new project (Greenfield project), GitHub Spec Kit prescribes a strict, logical sequence of steps to maintain development guardrails:
1. **`specify init`**: Initializes the repository structure and sets up the required Spec Kit files inside the source (`/src`) folder.
2. **`/speckit.constitution`**: Generates a global `constitution.md` file that codifies project-wide principles, constraints, architectural patterns, and non-negotiable standards.
3. **`/speckit.specify`**: Authors a clear functional specification for the desired feature.
4. **`/speckit.plan`**: Translates the spec into technical implementation steps.
5. **`/speckit.tasks`**: Breaks the plan down into a granular checklist.
6. **`/speckit.implement`**: Instructs the AI agent to generate clean code that strictly adheres to the established context.

#### C. The Project Constitution (`constitution.md`)
One of the most valuable artifacts learned is the project constitution. It serves as an architectural anchor that enforces consistency across the code base. It restricts the AI from making arbitrary tech-stack assumptions or violating design boundaries, keeping the software maintainable and uniform throughout the teamwork lifecycle.


## 3. Training Completion Verification

* **Course Module:** Introduction to Spec-Driven Development with GitHub Spec Kit (Greenfield Intro)
* **Platform:** Microsoft Learn / GitHub Open Source Guides
* **Status:** Fully Completed
* **Application to Project FOZ:** The team has successfully initialized GitHub Spec Kit within our `/src` directory, generated our `constitution.md` file, and is utilizing the SDD workflow to systematically build out functional groups such as Authentication, Post Creation, and AI-powered Post Summarization.
![SDD and Github Spec Kit Module Assessment](spec_kit_prove_assessment.png)
Completed SDD and Github Spec Kit Module Assessment
![Completed SDD and Github Spec Kit Course](spec_kit_prove.png)
Completed SDD and Github Spec Kit Course