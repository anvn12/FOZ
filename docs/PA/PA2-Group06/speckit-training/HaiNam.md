# Spec Kit Self Training

*Performed by: Nguyễn Hải Nam | Reviewed by: Nguyễn Tuấn An*

## Source

1. Net Ninja's Youtube video of Spec Kit tutorial

2. Microsoft Learn

## Contents

### What is Github Spec Kit

1. Github Spec Kit is the product of the mix between Spec-Drive Development (SDD) and AI coding assistants (Github Copilot, etc.)

2. Github Spec Kit helps me to just only specify the ideas through documents and don't go deep into code implementation.

3. Github Spec Kit also inherits many key features of SDD, especially 'the spec becomes the single of truth' feature. It can contribute directly to code.

### What I have learned

#### The workflow of Github Spec Kit

1. **Constitution:** `\speckit.constitution`. Set the project principles, constraints and environment (e.g. security, coding conventions, etc.). Needs to be accurate as AI agent uses this document to generate all the plans and code. Produces `constitution.md`.

2. **Specification:** `\speckit.specify`. Define the project by using user stories, acceptance criteria and requirements. Always check the generated spec. Describe in the way what, why but not how. Produces `spec.md`.

3. **Plan:** `\speckit.plan`. Turns the spec into a technical plan. Always check the plan if it is appropriate or not. Produces `plan.md`.

4. **Tasks:** `\speckit.tasks`. Breaks down a plan into separate lists that AI agent can follow and execute. Produces `tasks.md`. 

5. **Implement:** `\speckit.implement`. Uses the tasks above to generate code. Should run test and manual check.

6. **Clarify, Analyze and Checklist:** `\speckit.clarify`, `\speckit.analyze`, `\speckit.checklist`. Identify missing details of the spec, check the plan and tasks and generate verification for the spec.

#### Key excerpts

1. **Always put constitution at the first order:** Make sure the spec does not conflict with the constitution.

2. **Always review AI outputs:** AI agent is the tool, but you are the brain.

3. **Analyze the plan before breaking it into tasks:** This will help finding unambiguous and missing details, as well as conflicts between constitution and other commands.

4. **Follow the sequence:** Run commands in order. Each builds on previous outputs. 