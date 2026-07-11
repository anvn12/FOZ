# Spec Kit  Self Training Notes

*Performed by: Võ An Phú | Reviewed by: Phạm Đinh Gia Khánh*

Source: Net Ninja Spec Kit tutorial videos and Microsoft Learn

## What is Spec Kit / SDD

- Spec Kit is a framework for SDD (Spec-Driven Development). SDD helps me implement features by specifying what I want to implement without having to go too deeply into technical implementation details.
- With Spec Kit, I learned how the SDD workflow can drastically increase my coding efficiency compared to just normal prompting because the AI works from a written, reviewed spec instead of guessing from a prompt.
- Core idea: rite the spec first, then let the agent generate plan + tasks + code from it. The spec is the single source of truth; code is written from of it.

## The workflow 

1. **Constitution**: set the project's principles once (stack, testing rules, naming, security,...). Every later step is checked against it.
2. **Specify**: describe the feature in easy to understand language: what it does, who uses it, edge cases, constraints. Produces `spec.md`.
3. **Plan**: turn the spec into a technical plan: architecture, data model, file/module layout, sequencing. Produces `plan.md`.
4. **Tasks**: break the plan into a task list that the agent can execute. Produces `tasks.md`.
5. **Implement / Analyze / Clarify / Checklist**  execute tasks, review the spec vs plan vs tasks for gaps, ask clarifying questions, and run a final checklist before merging.

We need to do each comamnds in order because each one gives the next command the needed information, we dont just code right away

## Key things I learned

- **The constitution is the highest authority.** If a spec conflicts with it, the spec changes  not the constitution. Constitution edits are a separate, explicit step.
- **Specify first** Mixing what and how in the same step is what makes normal prompting slow and distracts the AI. So we need to specify **what** we want to build first then plan **how** we di it, separating them keeps each doc focused.
- **One feature per `/speckit.specify`.** Dont dump a whole big feature into one spec, split it into smaller feature.
- **The spec is written, not inferred.** The agent will infer missing context from spec/plan/tasks but it will not hallucinate requirements, so writing them down explicitly is what saves rework.
- **Analyze before implement catches the expensive mistakes.** Running `/speckit.analyze` after using `/speckit.tasks` helps finding gaps between commands and constitution conflicts while they are still cheap to fix as we are yet to implement them.


