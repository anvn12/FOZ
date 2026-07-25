# Spec Kit  Self Training Notes

*Performed by: Nguyễn Tuấn An | Reviewed by: Võ An Phú*

Source: Net Ninja Spec Kit tutorial video and Microsoft Learn

- The video introduces Spec Kit as a framework for Spec-Driven Development which helps implement features by specifying what to implement without delving too deeply into technical implementation details.
- It shows how to implement spec kit

## The Development Cycle

/constitution: outlines the core, binding principles for the overall application, such as requiring a focus on accessibility and UX.

/spec: creates a new high-level specification document for the feature you want to add (e.g., a stats dashboard) and creates a new Git branch.

/plan: generates a detailed technical implementation plan based on your spec and any technical preferences (like using Tailwind or a specific UI library).

/tasks: converts the entire technical plan into a logical, actionable list of coding tasks.

/implement: instructs the coding agent to finally start writing the code for the new feature based directly on the approved tasks and plan.

/clarify (optional): has the coding agent review the initial spec and ask you questions to clarify any underspecified areas.

/analyze (optional): checks the plan, specs, and tasks to ensure they are all aligned without any conflicting instructions.

Run these in order
